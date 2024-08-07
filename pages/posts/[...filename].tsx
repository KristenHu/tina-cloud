import { Post } from "../../components/posts/post";
import { client } from "../../tina/__generated__/client";
import { useTina } from "tinacms/dist/react";

import { InferGetStaticPropsType } from "next";
import Layout from "../../components/layout/layout";
import { useState, useEffect } from "react";
// Use the props returned by get static props
export default function BlogPostPage(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const lan = navigator.language;
    localStorage.setItem("language", lan);
    setLanguage(lan);
  }, []);

  const changeLan = (lan: string) => {
    setLanguage(lan);
    localStorage.setItem("language", lan);
  };

  if (data && data.post) {
    return (
      <Layout data={data.global} language={language} changeLan={changeLan}>
        <Post {...data.post} />
      </Layout>
    );
  }
  return (
    <Layout data={data.global} language={language} changeLan={changeLan}>
      <div>No data</div>;
    </Layout>
  );
}

export const getStaticProps = async ({ params }) => {
  const relativePath = Array.isArray(params.filename)
    ? `${params.filename.join("/")}.mdx`
    : `${params.filename}.mdx`;

  const tinaProps = await client.queries.blogPostQuery({
    relativePath,
  });

  return {
    props: {
      ...tinaProps,
    },
  };
};

/**
 * To build the blog post pages we just iterate through the list of
 * posts and provide their "filename" as part of the URL path
 *
 * So a blog post at "content/posts/hello.md" would
 * be viewable at http://localhost:3000/posts/hello
 */
export const getStaticPaths = async () => {
  const postsListData = await client.queries.postConnection();

  return {
    paths: postsListData.data.postConnection.edges.map((post) => ({
      params: { filename: post.node._sys.filename.split("/") },
    })),
    fallback: "blocking",
  };
};

export type PostType = InferGetStaticPropsType<
  typeof getStaticProps
>["data"]["post"];
