import { LinkButton, PageHeader } from '../components/ui';

export function NotFound() {
  return (
    <div>
      <PageHeader title="Not found" back="/" />
      <p className="text-muted">This page does not exist.</p>
      <LinkButton to="/" variant="primary" className="mt-6">
        Go home
      </LinkButton>
    </div>
  );
}
