import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import dynamic from 'next/dynamic'

const Test = dynamic(
  () => import('./DashBoard1'),{ ssr: false}
)

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>AHPB-01</title>
        <meta name="description" content="AHPB-01" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Test />
    </div>
  )
}