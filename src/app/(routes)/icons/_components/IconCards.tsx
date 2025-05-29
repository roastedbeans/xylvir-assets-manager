'use client';
import React, { useState } from 'react';
import { IconComponent } from '@/types/icon-component';
import { Button } from '@/components/ui/button';
import { Download, CopyFile, Checkmark } from '@carbon/icons-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import JSZip from 'jszip';

interface IconCardsProps {
	icon: IconComponent[];
}

const IconCards = ({ icon }: IconCardsProps) => {
	const [error, setError] = useState<Record<string, boolean>>({});
	const [copiedIcon, setCopiedIcon] = useState<string | null>(null);
	const [isDownloading, setIsDownloading] = useState(false);

	// Handle error for specific icon
	const handleError = (name: string) => {
		console.error(`Error rendering icon: ${name}`);
		setError((prev) => ({ ...prev, [name]: true }));
	};
	const copySVGToClipboard = async (name: string) => {
		try {
			// Find the title div and navigate up to the container
			const titleDiv = document.querySelector(`div[title="${name}"]`);
			if (!titleDiv) {
				throw new Error(`Title div for ${name} not found`);
			}

			// Get the parent container
			const container = titleDiv.parentElement;
			if (!container) {
				throw new Error(`Container for ${name} not found`);
			}

			// Find the SVG inside the container
			const svgElement = container.querySelector('svg');
			if (!svgElement) {
				throw new Error('SVG element not found');
			}

			// Clone the SVG to avoid modifying the original
			const svgClone = svgElement.cloneNode(true) as SVGElement;

			// Enhance SVG for better compatibility with design tools
			svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

			// Set viewBox if not already present
			if (!svgClone.getAttribute('viewBox')) {
				const width = svgClone.getAttribute('width') || '24';
				const height = svgClone.getAttribute('height') || '24';
				svgClone.setAttribute('viewBox', `0 0 ${width} ${height}`);
			}

			// Make SVG color-changeable by replacing hard-coded colors with currentColor
			const paths = svgClone.querySelectorAll('path, circle, rect, line, polyline, polygon');
			paths.forEach((path) => {
				// Remove any explicit fill colors if present
				if (path.hasAttribute('fill') && path.getAttribute('fill') !== 'none') {
					path.setAttribute('fill', 'currentColor');
				}

				// Remove any explicit stroke colors if present
				if (path.hasAttribute('stroke') && path.getAttribute('stroke') !== 'none') {
					path.setAttribute('stroke', 'currentColor');
				}
			});

			// Convert SVG to a clean string with XML declaration
			const serializer = new XMLSerializer();
			let svgString = serializer.serializeToString(svgClone);

			// Ensure proper XML formatting
			svgString = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' + svgString;

			// Method 1: Try to copy as SVG text to clipboard
			await navigator.clipboard.writeText(svgString);

			// Method 2: Also create a hidden textarea with the SVG content
			// This provides a fallback for platforms that handle copy/paste differently
			const textarea = document.createElement('textarea');
			textarea.value = svgString;
			textarea.style.position = 'fixed';
			textarea.style.left = '-9999px';
			textarea.style.top = '-9999px';
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);

			// Set copied state and clear it after 2 seconds
			setCopiedIcon(name);
			setTimeout(() => setCopiedIcon(null), 2000);

			// Show success notification with guidance
			toast.success(
				`${name.replace(
					/(?:16|20|24|32)$/,
					''
				)} copied as editable SVG. Paste into a text editor first if direct paste fails.`,
				{
					duration: 5000,
				}
			);
		} catch (err) {
			console.error('Error copying SVG:', err);

			// Fallback to download if clipboard operations fail
			downloadSVG(name);
		}
	};

	// Fallback download function in case clipboard operations fail
	const downloadSVG = (name: string) => {
		try {
			// Find the SVG again
			const titleDiv = document.querySelector(`div[title="${name}"]`);
			if (!titleDiv || !titleDiv.parentElement) return;

			const svgElement = titleDiv.parentElement.querySelector('svg');
			if (!svgElement) return;

			// Clone and process the SVG as before
			const svgClone = svgElement.cloneNode(true) as SVGElement;
			svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

			// Make SVG color-changeable
			const paths = svgClone.querySelectorAll('path, circle, rect, line, polyline, polygon');
			paths.forEach((path) => {
				if (path.hasAttribute('fill') && path.getAttribute('fill') !== 'none') {
					path.setAttribute('fill', 'currentColor');
				}
				if (path.hasAttribute('stroke') && path.getAttribute('stroke') !== 'none') {
					path.setAttribute('stroke', 'currentColor');
				}
			});

			// Convert and download
			const serializer = new XMLSerializer();
			let svgString =
				'<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' + serializer.serializeToString(svgClone);

			const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(svgBlob);

			const downloadLink = document.createElement('a');
			downloadLink.download = `${name.replace(/(?:16|20|24|32)$/, '')}.svg`;
			downloadLink.href = url;
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);

			setTimeout(() => URL.revokeObjectURL(url), 100);

			toast.info(`Clipboard copy failed. SVG downloaded instead - you can import it into your design tool.`, {
				duration: 5000,
			});
		} catch (downloadErr) {
			console.error('Error in fallback download:', downloadErr);
			toast.error('Failed to process SVG');
		}
	};

	const downloadAllIcons = async () => {
		try {
			setIsDownloading(true);
			const zip = new JSZip();

			// Process each icon
			for (const { name, size } of icon) {
				try {
					// Fetch the SVG file directly
					const response = await fetch(`/icons/health-icons/${name}.svg`);
					if (!response.ok) {
						console.error(`Failed to fetch ${name}.svg`);
						continue;
					}

					let svgString = await response.text();

					// Process the SVG to make it color-changeable
					const parser = new DOMParser();
					const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
					const svgElement = svgDoc.documentElement;

					// Add xmlns if not present
					if (!svgElement.getAttribute('xmlns')) {
						svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
					}

					// Make SVG color-changeable
					const paths = svgElement.querySelectorAll('path, circle, rect, line, polyline, polygon');
					paths.forEach((path) => {
						if (path.hasAttribute('fill') && path.getAttribute('fill') !== 'none') {
							path.setAttribute('fill', 'currentColor');
						}
						if (path.hasAttribute('stroke') && path.getAttribute('stroke') !== 'none') {
							path.setAttribute('stroke', 'currentColor');
						}
					});

					// Convert back to string
					const serializer = new XMLSerializer();
					svgString =
						'<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' + serializer.serializeToString(svgElement);

					// Add to zip
					zip.file(`${name}.svg`, svgString);
				} catch (err) {
					console.error(`Error processing icon ${name}:`, err);
				}
			}

			// Generate and download zip
			const content = await zip.generateAsync({ type: 'blob' });
			const url = URL.createObjectURL(content);
			const downloadLink = document.createElement('a');
			downloadLink.href = url;
			downloadLink.download = 'health-icons.zip';
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
			URL.revokeObjectURL(url);

			toast.success(`Downloaded ${icon.length} icons as ZIP file`);
		} catch (err) {
			console.error('Error creating zip:', err);
			toast.error('Failed to create ZIP file');
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<div className='space-y-4'>
			<div className='flex justify-end'>
				<Button
					variant='outline'
					className='gap-2'
					onClick={downloadAllIcons}
					disabled={isDownloading}>
					<Download />
					{isDownloading ? 'Downloading...' : 'Download All'}
				</Button>
			</div>
			<div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-8 gap-1'>
				{icon.map(({ name, displayName, Component, size }, index) => (
					<Card
						key={name + '_' + index}
						className='relative group flex flex-col items-center justify-center p-4 gap-2 aspect-square rounded-none'>
						<div className='flex items-center justify-center'>
							{!error[name] ? (
								<div style={{ width: size, height: size }}>
									<Component
										size={size}
										aria-hidden='true'
										onError={() => handleError(name)}
									/>
								</div>
							) : (
								<div className='w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs text-secondary-foreground'>
									error
								</div>
							)}
						</div>
						<div
							className='absolute bottom-0 left-0 p-4 text-xs text-center text-secondary-foreground w-full line-clamp-2'
							title={displayName}>
							{displayName.split(/(?=[A-Z])/).map((part, index) => (
								<span
									key={index}
									className='capitalize'>
									{part + ' '}
								</span>
							))}
						</div>
						<div className='absolute top-2 right-2 lg:hidden group-hover:block'>
							<Button
								variant='ghost'
								size='icon'
								className={`text-secondary-foreground hover:bg-secondary transition-all duration-200 ${
									copiedIcon === name ? 'bg-green-100 text-green-600' : ''
								}`}
								onClick={() => copySVGToClipboard(name)}>
								{copiedIcon === name ? <Checkmark /> : <CopyFile />}
							</Button>
							<Button
								variant='ghost'
								size='icon'
								className='text-secondary-foreground hover:bg-secondary'
								onClick={() => downloadSVG(name)}>
								<Download />
							</Button>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
};

export default IconCards;
