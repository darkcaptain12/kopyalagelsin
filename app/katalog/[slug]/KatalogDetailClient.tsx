"use client";

import KatalogViewer from "@/app/katalog/KatalogViewer";

interface Props {
  pdfPath: string;
  title: string;
}

export default function KatalogDetailClient({ pdfPath }: Props) {
  return <KatalogViewer pdfPath={pdfPath} />;
}
