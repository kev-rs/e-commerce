import { NextApiRequest, NextApiResponse } from "next";
import formidable from 'formidable';
import fs from 'fs';

type Data = { message: string }

export const config = {
  api: {
    bodyParser: false
  }
}

const saveFile = async (file: formidable.File) => {
  const data = fs.readFileSync(file.filepath);
  fs.writeFileSync(`./public/${file.originalFilename}`, data);
  fs.unlinkSync(file.filepath)
  return;
}
 
const parseFiles = async (req: NextApiRequest) => {

  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      console.log({ err, fields, files })

      if(err) return reject(err);

      await saveFile(files.file as formidable.File);
      resolve(true);
    })
  })

}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

  await parseFiles(req)

  res.status(201).json({ message: 'Image uploaded' })
}