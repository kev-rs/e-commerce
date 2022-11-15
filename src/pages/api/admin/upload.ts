import { NextApiRequest, NextApiResponse } from "next";
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary'
import cookies from 'cookie';
// import fs from 'fs';

cloudinary.config(process.env.CLOUDINARY_URL ?? '');

type Data = { message: string } | { file: { secure_url: string; public_id: string; } }

export const config = {
  api: {
    bodyParser: false
  }
};

const saveFile = async (file: formidable.File): Promise<{ secure_url: string; public_id: string; }> => {
  // const data = fs.readFileSync(file.filepath); // read temporal path
  // fs.writeFileSync(`./public/${file.originalFilename}`, data); // move file to the new path
  // fs.unlinkSync(file.filepath) // remove file from temporal path
  // return;

  const { secure_url, public_id } = await cloudinary.uploader.upload(file.filepath /* this is the path of the image */); // upload image to cloudinary
  return { secure_url, public_id }
}
 
const parseFiles = async (req: NextApiRequest): Promise<{ secure_url: string; public_id: string; }> => {

  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if(err) return reject(err);
      const img_file = await saveFile(files.file as formidable.File);
      resolve(img_file);
    })
  })

}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const asd = cookies.serialize('images', '', {maxAge: 0})
  res.setHeader('images', asd)
  if(req.method === 'POST') {
    const img_file = await parseFiles(req);
    return res.status(201).json({ file: img_file });
    
  } else if(req.method === 'DELETE') {
    const { query } = req.query as { query: string };
    const [ id, extension ] = query.substring(query.lastIndexOf('/') + 1).split('.')
    await cloudinary.uploader.destroy(id);
    return res.status(200).json({ message: 'deleted :)' })
  } else {
    return res.status(400).json({ message: `Method -${req.method}- not allowed` });
  }
}