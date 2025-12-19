import { Footer, Navbar } from "../components";

const AboutPage = () => {
  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center">About Us</h1>
        <hr />
        <p className="lead text-center">
          We're a small online shop built around one simple idea, browsing should feel easy, and checkout should not feel like homework.
          This project is a full stack e commerce demo where you can explore products, search and sort, see what's in stock, and place an order with a smooth flow.
          If you make an account, you can save your shipping and payment details, then view your purchase history later in your Account page.
          <br /><br />
          Behind the scenes, we keep inventory updated as orders are placed, and we treat your saved info as “default” settings so checkout can prefill when you're logged in.
          Anyway, if you're here testing features, try searching by category keywords, sorting by price, and placing an order to see the order summary.
          That's the fun part, it feels like a real store, minus the awkward mall lighting.
        </p>
      </div>
      <Footer />
    </>
  )
}

export default AboutPage;
