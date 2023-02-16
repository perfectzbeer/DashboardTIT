import Head from 'next/head';
import PriceCurveChart from './chart';

export default function Home() {
  return (
    <div >
      <Head>
        <title>Create Next App</title>
      </Head>

      <main >
        <PriceCurveChart />
      </main>

      <footer ></footer>
    </div>
  );
}