import Head from "next/head"
import { Navbar, SideMenu } from "../ui";

interface Props {
  title: string;
  pageInfo: string;
  imageUrl?: string;
  children: JSX.Element | JSX.Element[]
}

export const ShopLayout: React.FC<Props> = ({ children, title, pageInfo, imageUrl }) => {
  return (
    <>
      <Head>
        <title>{`Tesla Shop ${title}`}</title>
        <meta name='description' content={pageInfo} />
        <meta name='og:title' content={title} />
        <meta name='og:description' content={pageInfo} />
        { imageUrl && <meta name='og:image' content={imageUrl} /> }
      </Head>

      <nav>
        <Navbar />
      </nav>

      <SideMenu />

      <main style={{
        margin: '80px auto',
        maxWidth: '1440px',
        padding: '0px 30px'
      }}>
        { children }
      </main>

      <footer>
        {/* Footer */}
      </footer>
    </>
  )
}
