// Description: Util function to be imported where it needed
//
import { writeFileSync } from "fs";
// npm modules
import { imageSync } from "qr-image";

//  funtion to generate QR code image from text.
export const generateQR = (
  qr_text,
  qr_image_path,
  doc,
  option,
  filepathImageLogo
) => {
  const qrcode_png = imageSync(qr_text, { type: "png" });

  writeFileSync(qr_image_path, qrcode_png, (err) => {
    if (err) {
      console.log(err);
    }
  });
  generatePDF(doc, option, filepathImageLogo, qr_image_path);
};
// prices dictionary mapping
const prices = new Map();
prices.set("1", "100").set("24", "300").set("168", "1000").set("720", "3500");
// function to get price from duration.
const price = (duration) => {
  const currency = "Fr";
  return prices.get(duration) ? prices.get(duration) + currency : "Gratuit";
};

// function to generate PDF file.
const generatePDF = (doc, option, filepathImageLogo, path_to_imageQR) => {
  doc
    .fontSize(10)
    .font("Courier-BoldOblique")
    .fillColor("orange")
    .image(filepathImageLogo, {
      align: "center",
      valign: "center",
      width: 80,
    })
    .text(`WiFi ILLIMITÉ`)
    .fontSize(10)
    .fillColor("red")
    .text(price(option.duration) + ` ${option.comment}`, { align: "center" })
    .translate(40, 0)
    .image(path_to_imageQR, {
      fit: [60, 60],
      align: "center",
      valign: "center",
    })
    .fontSize(10)
    .fillColor("black")
    .translate(5, 0)
    .text(option.code)
    .addPage();
};

export default generateQR;
