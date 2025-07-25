import { useState, type FormEvent } from "react";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";

const Upload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);

    const companyName = formData.get("company-name");
    const jobTitle = formData.get("job-title");
    const jobDescription = formData.get("job-description");

    console.log({
      companyName,
      jobTitle,
      jobDescription,
      file,
    });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart Feedback for your job</h1>
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
            <h2>Drop your resume here</h2>
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
                  placeholder="Nama Pekerjaan"
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
