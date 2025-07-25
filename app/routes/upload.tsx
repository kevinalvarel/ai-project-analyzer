import { prepareInstructions } from "../../constants/index";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);
    setStatusText("Sedang mengunggah file ...");
    const uploadedFile = await fs.upload([file]);

    if (!uploadedFile) return setStatusText("Kesalahan: Gagal mengunggah file");

    setStatusText("Mengubah ke gambar...");
    const imageFile = await convertPdfToImage(file);
    if (!imageFile.file)
      return setStatusText("Kesalahan: Gagal mengubah PDF ke gambar");

    setStatusText("Mengunggah gambar ...");

    const uploadedImage = await fs.upload([imageFile.file]);
    if (!uploadedImage)
      return setStatusText("Kesalahan: Gagal mengunggah gambar");

    setStatusText("Menyiapkan data ...");

    const uuid = generateUUID();
    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: "",
    };

    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    setStatusText("Menganalisa...");

    const feedback = await ai.feedback(
      uploadedFile.path,
      prepareInstructions({ jobTitle, jobDescription })
    );
    if (!feedback) return setStatusText("Kesalahan: Gagal menganalisa resume");

    const feedbackText =
      typeof feedback.message.content === "string"
        ? feedback.message.content
        : feedback.message.content[0].text;

    data.feedback = JSON.parse(feedbackText);
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText("Analisa selesai...");
    navigate(`/resume/${uuid}`);
  };

  // Handle Submit
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!file) return;

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  // Tampilan
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Ketahui hasil yang kamu inginkan</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img
                src="/images/resume_scan.gif"
                alt="wait"
                className="w-full"
              />
            </>
          ) : (
            <h2>Unggah CV kamu disini</h2>
          )}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="form-div">
                <label htmlFor="company-name">Nama Perusahaan / Instansi</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Nama Perusahaan / Instansi"
                  id="company-name"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Nama Pekerjaan</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Nama Pekerjaan"
                  id="job-title"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Deskripsi Pekerjaan</label>
                <textarea
                  rows={6}
                  name="job-description"
                  placeholder="Deskripsi Pekerjaan"
                  id="job-description"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Unggah CV</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
              <button className="primary-button" type="submit">
                Cek CV
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;
