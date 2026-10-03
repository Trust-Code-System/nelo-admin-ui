export const rail = () => (
  <div className="atelier-rail">
    {[
      ["01", "Requested", "4", "done"],
      ["02", "Measured", "7", "done"],
      ["03", "Cutting", "5", "current"],
      ["04", "Sewing", "9", ""],
      ["05", "Fitting", "6", ""],
      ["06", "Ready", "7", ""],
    ].map((s, index) => (
      <div className={"stage " + s[3]} key={index}>
        <div className="stage-num">{s[0]}</div>
        <div className="stage-name">{s[1]}</div>
        <div className="stage-count">
          {s[2]}
          {" garments"}
        </div>
        <i className="stage-dot" />
      </div>
    ))}
  </div>
);
