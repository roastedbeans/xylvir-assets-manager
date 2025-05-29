'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BreadcrumbLink } from './ui/breadcrumb';
import { BreadcrumbItem } from './ui/breadcrumb';
import { BreadcrumbList } from './ui/breadcrumb';
import { SidebarInset, SidebarTrigger } from './ui/sidebar';
import { SidebarProvider } from './ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { Breadcrumb } from './ui/breadcrumb';
import { Separator } from './ui/separator';
import { BreadcrumbSeparator } from './ui/breadcrumb';
import { BreadcrumbPage } from './ui/breadcrumb';

const Sidebar = ({ children }: { children: React.ReactNode }) => {
	const [isClient, setIsClient] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) return null;

	return (
		<SidebarProvider className='h-screen overflow-hidden'>
			<AppSidebar />
			<SidebarInset>
				<header className='flex h-16 shrink-0 items-center gap-2 border-b absolute top-0 z-[999] bg-background w-full'>
					<div className='flex items-center gap-2 px-3'>
						<SidebarTrigger />
						<Separator
							orientation='vertical'
							className='mr-2 h-4'
						/>
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className='hidden md:block'>
									<BreadcrumbLink href='/'>Dashboard</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className='hidden md:block' />
								<BreadcrumbItem>
									<BreadcrumbPage className='uppercase'>{pathname.split('/').pop()}</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div className='mt-16 h-screen overflow-y-auto'>{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default Sidebar;
