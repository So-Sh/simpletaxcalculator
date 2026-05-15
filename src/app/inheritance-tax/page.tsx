import ToolPageLayout from '@/components/layout/ToolPageLayout'
import ComingSoon from '@/components/ui/ComingSoon'


export default function InheritanceTaxPillarPage() {

    return (
        <>
            <ToolPageLayout>
                <ComingSoon title='Inheritance Tax Calculator' description='Calculate US inheritance tax instantly for any state. 
                Select a state rate belowfor a quick estimate, or choose your state from the directory for exaccounty-level rates and local breakdowns.' >
                </ComingSoon>
            </ToolPageLayout>
        </>
    )
}