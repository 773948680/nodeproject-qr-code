// Description: Generate PDF file with QR code for WiFi access.
//
// node js modules
import path, { join } from "path";
import { fileURLToPath } from "url";
import open from "open";
import { createWriteStream, createReadStream } from "fs";
import { unlink } from "node:fs/promises";

// npm modules
import PDFDocument from "pdfkit";
import csvParser from "csv-parser";

// import util functions
import { generateQR } from "./utils/util.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// data file path to read from
const filepathTocsv = join(__dirname, "data/vouchers.csv");
// qr code image file path to write to
let filepathImageQR = "./outputs/qrcode.png";
// image file path to read to
const filepathImageLogo = join(__dirname, "images/logo.png");

// Create a PDF document
const doc = new PDFDocument({
  size: [160, 160],
  margins: {
    top: 5,
    bottom: 10,
    left: 5,
    right: 5,
  },
});

// Pipe its output somewhere, like to a file
const outputFilename = `./outputs/vouchers.pdf`;
doc.pipe(createWriteStream(outputFilename));

// Create a QR code for each line of the CSV file.
createReadStream(filepathTocsv)
  .pipe(csvParser())
  .on("error", (err) => console.log(err))
  .on("data", async (rowData) => {
    const data = {
      code: rowData.code,
      comment: rowData.comment,
      duration: rowData.duration,
    };
    // generate the qr code
    generateQR(filepathImageQR, doc, data, filepathImageLogo);
  })
  .on("end", async () => {
    doc.end();
    //Open pdf file in VS Code.
    open(outputFilename, { app: "code" });
    try {
      // delete QR code image file now that we have the PDF file.
      await unlink(filepathImageQR);
      // console.log("successfully deleted ", filepathImageQR);
    } catch (error) {
      console.error("there was an error:", error.message);
    }
  });
