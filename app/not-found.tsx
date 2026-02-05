
'use client';

import Link from 'next/link';


export async function getStaticProps(context) {
    const data = await fetchData(context.params.id);
    if (!data) {
        return {
            notFound: true,
        };
    }
    return {
        props: { data },
    };
}
