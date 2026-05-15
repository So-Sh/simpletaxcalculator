import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import ToolPageLayout from '@/components/layout/ToolPageLayout'
import ComingSoon from '@/components/ui/ComingSoon'


export default function PropertyTaxPillarPage() {

    return (
        <>
            <ToolPageLayout>
                <ComingSoon title='Property Tax Calculator' description='Calculate US property tax instantly for any state. Select a state rate below
                        for a quick estimate, or choose your state from the directory for exact
                        county-level rates and local breakdowns.' >
                </ComingSoon>
            </ToolPageLayout>
        </>
    )
}