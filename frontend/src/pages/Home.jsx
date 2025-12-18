import { Navbar, Main, Product, Footer } from "../components";

function Home() {
  return (
    <>
      <Navbar />
      <Main />
      <Product showSearch />
      <Footer />
    </>
  );
}

export default Home;
