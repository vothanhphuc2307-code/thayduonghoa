import ExamRunner from '../../../components/ExamRunner.jsx';
export default async function TakeExamPage({ params }) {
  const { slug } = await params;
  return <div className="container page-wrap"><ExamRunner slug={slug} /></div>;
}
