import { Roles } from "@utils/constants";

const becomeRole = (role: string) => {
  fetch("/api/mock-role", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role,
    }),
  }).then(() => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    location.reload();
  });
};

export const ChangeRoleFooter = () => {
  return (
    <>
      {process.env.NEXT_PUBLIC_MOCK_NEXT_AUTH === "true" && (
        <div className="bg-red-200">
          <div className="container mx-auto flex flex-col items-center gap-2 text-black">
            DEVELOPMENT ROLE SWITCHER:
            <button
              onClick={() => {
                becomeRole(Roles.Member);
              }}
            >
              student
            </button>
            <button
              onClick={() => {
                becomeRole(Roles.Admin);
              }}
            >
              teacher
            </button>
            <button
              onClick={() => {
                becomeRole(Roles.Guest);
              }}
            >
              guest
            </button>
            <button
              onClick={() => {
                becomeRole("UNAUTHENTICATED");
              }}
            >
              unauthenticated
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default ChangeRoleFooter;
