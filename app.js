// Description: Generate PDF file with QR code for WiFi access.
//
// node js modules
import path, { join } from "path";
import { fileURLToPath } from "url";
import open from "open";
import { createWriteStream, createReadStream, writeFileSync } from "fs";
import { unlink } from "node:fs/promises";

// npm modules
import PDFDocument from "pdfkit";
import { imageSync } from "qr-image";
import csvParser from "csv-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// data file path to read from
const filepath = join(__dirname, "data/vouchers_alassane A_20191031.csv");
// qr code image file path to write to
let filepathImageQR = `./outputs/qrcode-${Date.now().toString()}.png`;
// image file path to read to
const filepathImageLogo = join(__dirname, "images/logo.png");

// Create a document
const doc = new PDFDocument({
  size: [145, 160],
  margins: {
    // by default, all are 72
    top: 5,
    bottom: 10,
    left: 5,
    right: 5,
  },
});

// Pipe its output somewhere, like to a file
const outputFilename = `./outputs/vouchers-${Date.now()
  .toString()
  .substring(5)}.pdf`;

doc.pipe(createWriteStream(outputFilename));

const ssid = "Bloom";
const nt_type = "none";
const prices = new Map();
const currency = "Fr";
// prices dictionary mapping
prices.set("1", "100").set("24", "300").set("168", "1000").set("720", "3500");

//  funtion to generate QR code image from text.
const generateQR = (qr_text, qr_image_path) => {
  const qrcode_png = imageSync(qr_text, { type: "png" });

  writeFileSync(qr_image_path, qrcode_png, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

// function to get price from duration.
const price = (duration) => {
  return prices.get(duration) ? prices.get(duration) + currency : "Gratuit";
};
// function to generate PDF file.
const generatePDF = (option, path_to_imageQR) => {
  doc
    .fontSize(10)
    .font("Courier-BoldOblique")
    .fillColor("orange")
    .image(filepathImageLogo, {
      width: 60,
    })
    .text(`WiFi ILLIMITÉ`)
    .fontSize(10)
    .fillColor("red")
    .text(price(option.duration) + ` ${option.comment}`, { align: "right" })
    .image(path_to_imageQR, {
      align: "center",
      width: 70,
    })
    .fontSize(10)
    .fillColor("black")
    .text(option.code)
    .addPage();
};
// Create a QR code for each line of the CSV file.
createReadStream(filepath)
  .pipe(csvParser())
  .on("error", (err) => console.log(err))
  .on("data", async (data) => {
    const { code, comment, duration } = data;
    const wifiCredntial = `WIFI:S:${ssid};T:${nt_type};P:${code};H:false;`;

    generateQR(wifiCredntial, filepathImageQR);
    const mydata = { code, comment, duration };
    generatePDF(mydata, filepathImageQR);
  })
  .on("end", async () => {
    doc.end();
    //Open pdf file in VS Code.
    open(outputFilename, { app: "code" });
    try {
      // delete QR code image file now that we have the PDF file.
      await unlink(filepathImageQR);
      console.log("successfully deleted ", filepathImageQR);
    } catch (error) {
      console.error("there was an error:", error.message);
    }
  });
