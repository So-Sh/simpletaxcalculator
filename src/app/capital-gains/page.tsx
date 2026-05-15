import ToolPageLayout from '@/components/layout/ToolPageLayout'
import ComingSoon from '@/components/ui/ComingSoon'


export default function GasTaxPillarPage() {

    return (
        <>
            <ToolPageLayout>
                <ComingSoon title='Capitla Gains Tax Calculator' description='Calculate US capital gains tax instantly for any state. Select a state rate below
                        for a quick estimate, or choose your state from the directory for exact
                        county-level rates and local breakdowns.' >
                </ComingSoon>
            </ToolPageLayout>
        </>
    )
}