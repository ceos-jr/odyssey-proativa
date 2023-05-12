import Head from "next/head";
import DashboardLayout from "@components/Layout/DashboardLayout";
import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "src/server/common/get-server-auth-session";
import { Roles } from "@utils/constants";
import { useSession } from "@utils/useSession";
import { trpc } from "@utils/trpc";

const Tasks = () => {
    
    const {data} = useSession();
    console.log(data);
    
    const allTasks = trpc.task.getTasksByUser.useQuery(data?.user?.id as string);
    console.log("MASQUEICOOOOO", allTasks.data);

    return (
        <>
            <Head>
                <title>Atividades • Proativa</title>
                <meta name="description" content="Odyssey Proativa" />
            </Head>
            <main className="container mx-auto flex h-max flex-col gap-4 p-4">
                Salamaleico
            </main>
        </>
    );
};

export default Tasks;

Tasks.getLayout = function getLayout(page: React.ReactElement) {
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
    } else if (session.user?.role === Roles.Guest) {
        return {
            redirect: {
                destination: "/guest",
                permanent: false,
            },
        };
    } else return { props: {} };
}
