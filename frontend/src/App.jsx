import { useState } from "react";
import Layout from "./components/Layout.jsx";
import Matches from "./components/Matches.jsx";
import PostEmptyLeg from "./components/PostEmptyLeg.jsx";
import PostLoad from "./components/PostLoad.jsx";

export default function App() {
  const [tab, setTab] = useState("matches");

  return (
    <Layout active={tab} onChange={setTab}>
      {tab === "matches" && <Matches />}
      {tab === "post-leg" && <PostEmptyLeg />}
      {tab === "post-load" && <PostLoad />}
    </Layout>
  );
}
