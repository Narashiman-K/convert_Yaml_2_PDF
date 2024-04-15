function convertToPdf() {
  const fileInput = document.getElementById("fileInput");
  const pdfViewer = document.getElementById("pdfViewer");

  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a YAML file.");
    return;
  }
  console.log("file : ", file);
  const reader = new FileReader();
  console.log("Reader : ", reader);
  reader.onload = function (event) {
    try {
      const yamlData = event.target.result;
      const formData = new FormData();
      console.log("Yaml Data : ", yamlData);
      console.log("Form Data : ", formData);
      formData.append(
        "file",
        new Blob([yamlData], { type: "application/octet-stream" })
      );

      fetch("/convert", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Failed to convert YAML to PDF. Status: ${response.status}`
            );
          }
          return response.arrayBuffer();
        })
        .then((pdfBuffer) => {
          const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
          console.log("PDF Blob : ", pdfBlob);
          const pdfUrl = URL.createObjectURL(pdfBlob);
          console.log("PDF URL : ", pdfUrl);
          pdfViewer.innerHTML = `<embed src="${pdfUrl}" type="application/pdf" width="100%" height="600px"/>`;
        })
        .catch((error) => {
          console.error("Error converting YAML to PDF:", error);
          alert(`Error converting YAML to PDF: ${error.message}`);
        });
    } catch (error) {
      console.error("Error reading YAML file:", error);
      alert(`Error reading YAML file: ${error.message}`);
    }
  };

  reader.readAsArrayBuffer(file);
}
