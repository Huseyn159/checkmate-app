import { useEffect, useState } from "react";

export function useAuthHydrated() {
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        setHydrated(true);
    }, []);
    return hydrated;
}