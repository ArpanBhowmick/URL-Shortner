
import Background from "./components/Background";
import Footer from "./components/Footer";
import Header from "./components/Header";
import History from "./components/History";

import MainCard from "./components/MainCard";
import {Toaster} from "react-hot-toast"




function App() {
  return (
    <>
    <Background>
      <Header />
      <MainCard/>
      {/* <History/> */}
      
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
