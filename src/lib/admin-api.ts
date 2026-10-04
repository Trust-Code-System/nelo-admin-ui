export interface Channel {
  id: string;
  code: string;
  token: string;
  permissions: string[];
}
export interface CurrentUser {
  id: string;
  identifier: string;
  channels: Channel[];
}
export type AppointmentStatus =
  "requested" | "confirmed" | "completed" | "cancelled" | "noShow";
export interface Appointment {
  id: string;
  purpose: string;
  context: string | null;
  locationMode: string;
  status: AppointmentStatus;
  startsAt: string;
  endsAt: string;
  timezone: string;
  locationDetails: string | null;
  notes: string | null;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string | null;
  };
}
export class AdminApiError extends Error {
  readonly code: string;
  constructor(message: string, code = "API_ERROR") {
    super(message);
    this.code = code;
  }
}
export const appointmentFields = `id purpose context locationMode status startsAt endsAt timezone locationDetails notes customer { id firstName lastName emailAddress phoneNumber }`;
export class AdminApi {
  private token = "";
  private endpoint: string;
  private transport: typeof fetch;
  constructor(endpoint: string, transport: typeof fetch = fetch) {
    this.endpoint = endpoint;
    this.transport = transport;
    const url = new URL(endpoint);
    if (
      url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
      )
    )
      throw new Error("Use HTTPS for the Admin API, or HTTP on localhost.");
    if (url.username || url.password || url.search || url.hash)
      throw new Error(
        "The API URL must not contain credentials, a query or a fragment.",
      );
  }
  clear() {
    this.token = "";
  }
  async request<T>(
    query: string,
    variables: Record<string, unknown> = {},
    channel?: string,
  ): Promise<T> {
    let response: Response;
    try {
      const transport = this.transport;
      response = await transport(this.endpoint, {
        method: "POST",
        credentials: "omit",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          ...(channel ? { "vendure-token": channel } : {}),
        },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(30000),
      });
    } catch {
      throw new AdminApiError(
        "Cannot reach the Admin API. Check the server and allowed browser origins.",
        "NETWORK",
      );
    }
    if (!response.ok)
      throw new AdminApiError(
        `Admin API returned HTTP ${response.status}.`,
        String(response.status),
      );
    const payload = (await readPayload(response)) as {
      data?: T;
      errors?: { message: string; extensions?: { code?: string } }[];
    };
    if (payload.errors?.length) {
      const code = payload.errors[0].extensions?.code ?? "API_ERROR";
      if (["UNAUTHORIZED", "FORBIDDEN"].includes(code))
        throw new AdminApiError(
          "Your session or channel permissions do not allow this operation. Sign in again or choose an authorized channel.",
          code,
        );
      throw new AdminApiError(payload.errors[0].message, code);
    }
    if (!payload.data)
      throw new AdminApiError(
        "The Admin API returned no data. Refresh before retrying an update.",
        "UNCERTAIN",
      );
    const token = response.headers.get("vendure-auth-token");
    if (token) this.token = token;
    return payload.data;
  }
  async login(username: string, password: string): Promise<CurrentUser> {
    this.clear();
    const data = await this.request<{
      login:
        | (CurrentUser & { __typename: "CurrentUser" })
        | { __typename: string; message: string; errorCode: string };
    }>(
      `mutation Login($username: String!, $password: String!) { login(username: $username, password: $password, rememberMe: false) { __typename ... on CurrentUser { id identifier channels { id code token permissions } } ... on ErrorResult { errorCode message } } }`,
      { username, password },
    );
    if (
      data.login.__typename !== "CurrentUser" ||
      !("channels" in data.login)
    ) {
      this.clear();
      throw new AdminApiError(
        "Sign-in failed. Check your administrator credentials.",
      );
    }
    if (!this.token)
      throw new AdminApiError(
        "The backend did not expose the session header. Check its bearer authentication and CORS configuration.",
      );
    return data.login;
  }
  async upload(channel: string, file: File) {
    const body = new FormData();
    body.set(
      "operations",
      JSON.stringify({
        query: `mutation Upload($input: [CreateAssetInput!]!) { createAssets(input: $input) { __typename ... on Asset { id } ... on ErrorResult { errorCode message } } }`,
        variables: { input: [{ file: null }] },
      }),
    );
    body.set("map", JSON.stringify({ "0": ["variables.input.0.file"] }));
    body.set("0", file);
    const transport = this.transport;
    let response: Response;
    try {
      response = await transport(this.endpoint, {
        method: "POST",
        credentials: "omit",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "vendure-token": channel,
          "Apollo-Require-Preflight": "true",
        },
        body,
        signal: AbortSignal.timeout(30000),
      });
    } catch {
      throw new AdminApiError(
        "Upload could not be confirmed. Check the asset list before retrying.",
        "NETWORK",
      );
    }
    if (!response.ok)
      throw new AdminApiError(
        `Upload returned HTTP ${response.status}.`,
        String(response.status),
      );
    const payload = (await readPayload(response)) as {
      data?: {
        createAssets: { id?: string; errorCode?: string; message?: string }[];
      };
      errors?: { message: string }[];
    };
    if (payload.errors?.length)
      throw new AdminApiError(payload.errors[0].message);
    const result = payload.data?.createAssets[0];
    if (!result?.id)
      throw new AdminApiError(
        result?.message ?? "Upload returned no asset. Refresh before retrying.",
        result?.errorCode ?? "UNCERTAIN",
      );
    return result;
  }
  async logout() {
    try {
      await this.request("mutation { logout { success } }");
    } finally {
      this.clear();
    }
  }
  async appointments(
    channel: string,
    skip: number,
    status?: AppointmentStatus,
    take = 20,
  ) {
    const result = await this.request<{
      atelierAppointments: { items: Appointment[]; totalItems: number };
    }>(
      `query Appointments($options: AtelierAppointmentAdminListOptions) { atelierAppointments(options: $options) { totalItems items { ${appointmentFields} } } }`,
      { options: { skip, take, ...(status ? { status: [status] } : {}) } },
      channel,
    );
    return result.atelierAppointments;
  }
  async transition(
    channel: string,
    action: "confirm" | "reschedule" | "cancel" | "complete" | "noShow",
    id: string,
    startsAt?: string,
  ) {
    const operation = {
      confirm: "confirmAtelierAppointment",
      reschedule: "rescheduleAtelierAppointment",
      cancel: "cancelAtelierAppointment",
      complete: "completeAtelierAppointment",
      noShow: "markAtelierAppointmentNoShow",
    }[action];
    const inputType =
      action === "confirm"
        ? "ConfirmAtelierAppointmentInput"
        : "RescheduleAtelierAppointmentInput";
    const inputAction = action === "confirm" || action === "reschedule";
    const variables = inputAction
      ? { input: { id, ...(startsAt ? { startsAt } : {}) } }
      : { id };
    return this.request<Record<string, Appointment>>(
      `mutation AppointmentAction($${inputAction ? `input: ${inputType}!` : "id: ID!"}) { ${operation}(${inputAction ? "input: $input" : "id: $id"}) { ${appointmentFields} } }`,
      variables,
      channel,
    );
  }
}

async function readPayload(response: Response): Promise<unknown> {
  try {
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object")
      throw new Error("Invalid payload");
    return payload;
  } catch {
    throw new AdminApiError(
      "The server response could not be read. Refresh and inspect the saved record before retrying an update.",
      "UNCERTAIN",
    );
  }
}
