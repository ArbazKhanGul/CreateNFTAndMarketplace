import App from "next/app";
import  TransactionsProvider  from "../components/Connection";
import "../styles/globals.css"
class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <TransactionsProvider>
        <Component {...pageProps} />
      </TransactionsProvider>
    );
  }
}

export default MyApp;