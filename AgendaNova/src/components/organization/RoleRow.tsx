import type { Role } from "../../types/agenda";
export function RoleRow({ role }: { role: Role }) {
  const value = (
    <>
      {role.value}
      {role.subline && (
        <>
          {" "}
          <span className="subline">{role.subline}</span>
        </>
      )}
    </>
  );
  return (
    <div className="roleRow">
      <p className="roleLabel">{role.label}</p>
      {role.valueTag === "span" ? (
        <span className="roleValue">{value}</span>
      ) : (
        <p className="roleValue">{value}</p>
      )}
    </div>
  );
}
