import { InspectionClientWrapper } from "./InspectionClientWrapper";

export function generateStaticParams() {
  return [{ id: 'demo' }, { id: 'f7c3e272-423c-4e5b-9db2-322b1c49c11d' }];
}

export default function InspectionQuestionnairePage() {
  return <InspectionClientWrapper />;
}
