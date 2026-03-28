
import Background from "./components/Background";
import Footer from "./components/Footer";
import Header from "./components/Header";

import MainCard from "./components/MainCard";
import {Toaster} from "react-hot-toast"




function App() {
  return (
    <>
    <Background>
      <Header />
      <MainCard/>
      
      <Footer />
      <Toaster
    position="top-right"
    reverseOrder={false}
    />
      </Background>
    </>
  );
}

export default App;
