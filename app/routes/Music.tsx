import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { decodeHtml } from "@/utils/decodeHtml";
import { ArrowLeft } from "lucide-react";

const getMusicQuestions = createServerFn({
  method: "GET",
}).handler(async () => {
  const response = await fetch(
    "https://opentdb.com/api.php?amount=10&category=12"
  );
  const data = await response.json();
  return data.results;
});

export const Route = createFileRoute("/Music")({
  component: MusicQuiz,
  loader: async () => await getMusicQuestions(),
});

function MusicQuiz() {
  const questions = Route.useLoaderData();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = (answer: string) => {
    if (answer === questions[currentQuestion].correct_answer) {
      setScore((prev) => prev + 1);
    }
    setCurrentQuestion((prev) => prev + 1);
  };

  const currentQ = questions[currentQuestion];
  const answers = [...currentQ.incorrect_answers, currentQ.correct_answer].sort(
    () => Math.random() - 0.5
  );

  if (currentQuestion >= questions.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-center">
              Final Score: {decodeHtml(String(score))} /{" "}
              {decodeHtml(String(questions.length))}
            </p>
            <Button
              className="w-full mt-4"
              onClick={() => window.location.reload()}
            >
              Play Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <Card className="w-full max-w-[600px]">
        <Link
          to="/"
          className="absolute left-4 top-4 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <ArrowLeft size={24} />
        </Link>
        <CardHeader>
          <CardTitle>{decodeHtml(currentQ.category)}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">{decodeHtml(currentQ.question)}</p>
          <div className="grid grid-cols-1 gap-2">
            {answers.map((answer) => (
              <Button
                key={answer}
                variant="outline"
                className="w-full"
                onClick={() => handleAnswer(answer)}
              >
                {decodeHtml(answer)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
