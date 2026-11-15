import ToolShell, { toolMetadata } from '@/components/Tools/ToolShell';
import Tool from '@/components/Tools/salary-to-hourly-calculator/Tool';
import { meta } from '@/components/Tools/salary-to-hourly-calculator/meta';

// The "Read next" list checks the date on each request, like the blog.
export const dynamic = 'force-dynamic';
export const metadata = toolMetadata(meta);

export default function Page() {
	return (
		<ToolShell meta={meta}>
			<Tool />
		</ToolShell>
	);
}
