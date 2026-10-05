import { useEffect, useState } from 'react';
import { Partner } from '../types';
import { getAllPartners } from '../api/partnerApi';

const usePartners = (params?: { type?: string }) => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const partnerType = params?.type;

    useEffect(() => {
        setLoading(true);
        getAllPartners(partnerType ? { type: partnerType } : undefined)
            .then((res) => { setPartners(res.partners); setTotal(res.total); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [partnerType]);

    return { partners, loading, total };
};

export default usePartners;