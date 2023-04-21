import AdminStats from "@components/admin/AdminStats";
import GuestUsers from "@components/admin/GuestUsers";
import LessonSuggestions from "@components/admin/LessonSuggestions";
import ModulesSuggestions from "@components/admin/ModulesSuggestions";
import MemberList from "@components/admin/MemberList";
import UserSubmissions from "@components/admin/UserSubmissions";
import DashboardLayout from "@components/Layout/DashboardLayout";
import { Roles } from "@utils/constants";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { getServerAuthSession } from "src/server/common/get-server-auth-session";

const Admin = () => {
  return (
    <>
      <Head>
        <title>Admin • Proativa</title>
        <meta name="description" content="Odyssey Proativa" />
      </Head>
      <main className="flex h-max flex-col gap-4 p-4">
        <AdminStats />
        <GuestUsers />
        <MemberList />
        <UserSubmissions />
        <ModulesSuggestions />
        <LessonSuggestions />
      </main>
    </>
  );
};

export default Admin;

Admin.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  } else if (session.user?.role !== Roles.Admin) {
    return {
      redirect: {
        destination: "/401",
        permanent: false,
      },
    };
  } else return { props: {} };
};
