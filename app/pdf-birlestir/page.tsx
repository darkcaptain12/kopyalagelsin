"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PDFDocument } from "pdf-lib";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";

export default function PdfMergePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfBlob, setMergedPdfBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length === 0) {
      setError("Lütfen en az bir PDF dosyası seçin.");
      return;
    }

    if (files.length !== pdfFiles.length) {
      setError("Bazı dosyalar PDF formatında değil ve atlandı.");
    } else {
      setError("");
    }

    setSelectedFiles((prev) => [...prev, ...pdfFiles]);
    setMergedPdfBlob(null); // Reset merged PDF when new files are selected
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedPdfBlob(null);
  };

  const handleMerge = async () => {
    if (selectedFiles.length === 0) {
      setError("Lütfen en az bir PDF dosyası seçin.");
      return;
    }

    setIsMerging(true);
    setError("");

    try {
      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();

      // Process each PDF file
      for (const file of selectedFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);

        // Copy all pages from the PDF to the merged document
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

        pages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      // Convert Uint8Array to Blob (TypeScript compatibility fix)
      const blob = new Blob([mergedPdfBytes as BlobPart], { type: "application/pdf" });

      setMergedPdfBlob(blob);
    } catch (err: any) {
      console.error("PDF merge error:", err);
      setError(`PDF birleştirme hatası: ${err.message || "Bilinmeyen hata"}`);
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergedPdfBlob) return;

    const url = URL.createObjectURL(mergedPdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `birlesmis-pdf-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUseInOrder = async () => {
    if (!mergedPdfBlob) return;

    try {
      // Convert blob to File
      const fileName = `birlesmis-pdf-${Date.now()}.pdf`;
      const file = new File([mergedPdfBlob as BlobPart], fileName, { type: "application/pdf" });

      // Store PDF in sessionStorage as base64 for reliable transfer
      const arrayBuffer = await mergedPdfBlob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      sessionStorage.setItem("mergedPdfData", base64);
      sessionStorage.setItem("mergedPdfFileName", fileName);

      // Also dispatch event for immediate transfer (if on same page)
      const event = new CustomEvent("mergedPdfReady", { detail: { file } });
      window.dispatchEvent(event);

      // Navigate to order form with hash
      router.push("/#siparis");
    } catch (error) {
      console.error("Error preparing PDF for order:", error);
      setError("PDF sipariş formuna aktarılırken bir hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementBar />
      <Navbar />
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">PDF Birleştirme Aracı</h1>
            <p className="text-gray-600 mb-8">
              Birden fazla PDF dosyanı tek dosyada birleştir, sonra baskı siparişine geç.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* File Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF Dosyaları Seç
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Seçilen Dosyalar ({selectedFiles.length})
                </h2>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-4 text-red-600 hover:text-red-800 transition"
                        type="button"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Merge Button */}
            {selectedFiles.length > 0 && !mergedPdfBlob && (
              <div className="mb-6">
                <button
                  onClick={handleMerge}
                  disabled={isMerging}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isMerging ? "Birleştiriliyor..." : "PDF&apos;leri Birleştir"}
                </button>
              </div>
            )}

            {/* Success Message and Actions */}
            {mergedPdfBlob && (
              <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-green-600 mr-3 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      PDF başarıyla birleştirildi!
                    </h3>
                    <p className="text-sm text-green-700 mb-4">
                      Birleştirilen PDF dosyasını indirebilir veya doğrudan sipariş verme sayfasında
                      kullanabilirsiniz.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleDownload}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                      >
                        PDF&apos;i İndir
                      </button>
                      <button
                        onClick={handleUseInOrder}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        Bu PDF ile Sipariş Ver
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Nasıl Kullanılır?</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Birden fazla PDF dosyası seçin (Ctrl/Cmd tuşu ile çoklu seçim yapabilirsiniz)</li>
                <li>&quot;PDF&apos;leri Birleştir&quot; butonuna tıklayın</li>
                <li>Birleştirilen PDF&apos;i indirebilir veya doğrudan sipariş verme sayfasında
                  kullanabilirsiniz</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
