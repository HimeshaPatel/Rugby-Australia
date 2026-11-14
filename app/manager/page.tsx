
import { getSites, getPages } from "@/lib/pages";
import { Manager } from "@/components/manager/Manager";

export const dynamic = "force-dynamic";

export default async function ManagerPage() {
    const [sites, pages] = await Promise.all([
        getSites(),
        getPages()
    ]);

    return (
        <Manager
            sites={sites}
            initialPages={pages}
        />
    );
}
