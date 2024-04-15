const express = require("express");
const fs = require("fs");
const path = require("path");
const os = require("os");
const jsyaml = require("js-yaml");
const pdfmake = require("pdfmake/build/pdfmake");
const pdfFonts = require("pdfmake/build/vfs_fonts");

pdfmake.vfs = pdfFonts.pdfMake.vfs;

const app = express();
const port = 3000;

app.use(express.static("public"));

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/convert", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    //    console.log("file in server.js: ", file);
    const yamlData = req.file.buffer.toString("utf8");
    const jsonData = jsyaml.load(yamlData);

    // console.log("Received YAML Data:", yamlData);
    // console.log("Parsed JSON Data:", jsonData);

    const pdfDefinition = {
      content: [
        { text: "YAML to PDF Conversion", style: "header" },
        { text: JSON.stringify(jsonData, null, 2), style: "code" },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        code: {
          fontSize: 12,
          fontFamily: "Courier",
          margin: [0, 0, 0, 10],
        },
      },
    };

    const pdfDoc = pdfmake.createPdf(pdfDefinition);

    pdfDoc.getBuffer((buffer) => {
      if (buffer.length === 0) {
        console.error("Empty PDF Buffer.");
        return res
          .status(500)
          .send("Error converting YAML to PDF: Empty PDF Buffer.");
      }

      // Get the user's home directory
      const homeDir = os.homedir();

      // Save the PDF to the Downloads folder in the user's home directory
      const filePath = path.join(homeDir, "Downloads", "generated_pdf.pdf");

      // Create the Downloads folder if it doesn't exist
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      fs.writeFileSync(filePath, buffer);

      // console.log("PDF saved to:", filePath);

      // Respond with a success message or redirect to the PDF file
      res
        .status(200)
        .send(
          "PDF generated and saved. You can download it from: ~/Downloads/generated_pdf.pdf"
        );
    });
  } catch (error) {
    console.error("Error converting YAML to PDF:", error);
    res.status(500).send(`Error converting YAML to PDF: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// const express = require("express");
// const fs = require("fs");
// const jsyaml = require("js-yaml");
// const pdfmake = require("pdfmake/build/pdfmake");
// const pdfFonts = require("pdfmake/build/vfs_fonts");

// pdfmake.vfs = pdfFonts.pdfMake.vfs;

// const app = express();
// const port = 3000;

// app.use(express.static("public"));

// const multer = require("multer");
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// app.post("/convert", upload.single("file"), (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).send("No file uploaded.");
//     }

//     const yamlData = req.file.buffer.toString("utf8");
//     const jsonData = jsyaml.load(yamlData);

//     console.log("Received YAML Data:", yamlData);
//     console.log("Parsed JSON Data:", jsonData);

//     const pdfDefinition = {
//       content: [
//         { text: "YAML to PDF Conversion", style: "header" },
//         { text: JSON.stringify(jsonData, null, 2), style: "code" },
//       ],
//       styles: {
//         header: {
//           fontSize: 18,
//           bold: true,
//           margin: [0, 0, 0, 10],
//         },
//         code: {
//           fontSize: 12,
//           fontFamily: "Courier",
//           margin: [0, 0, 0, 10],
//         },
//       },
//     };

//     const pdfDoc = pdfmake.createPdf(pdfDefinition);

//     pdfDoc.getBuffer((buffer) => {
//       if (buffer.length === 0) {
//         console.error("Empty PDF Buffer.");
//         return res
//           .status(500)
//           .send("Error converting YAML to PDF: Empty PDF Buffer.");
//       }

//       console.log("PDF Buffer Length:", buffer.length);
//       res.setHeader("Content-Type", "application/pdf");
//       res.send(buffer);
//     });
//   } catch (error) {
//     console.error("Error converting YAML to PDF:", error);
//     res.status(500).send(`Error converting YAML to PDF: ${error.message}`);
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });
