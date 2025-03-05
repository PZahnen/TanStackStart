import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useState } from "react";
import { decodeHtml } from "@/utils/decodeHtml";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export const Route = createFileRoute("/Music")({
  component: MusicQuiz,
});

function MusicQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const musicQuestions = useQuery({
    queryKey: ["MusicQuestions"],
    queryFn(): Promise<Question[]> {
      return fetch("https://opentdb.com/api.php?amount=10&category=12")
        .then((res) => res.json())
        .then((data) => data.results);
    },
  });

  const handleAnswer = (answer: string) => {
    if (
      musicQuestions &&
      musicQuestions.data &&
      answer === musicQuestions.data[currentQuestion].correct_answer
    ) {
      setScore((prev) => prev + 1);
      setCurrentQuestion((prev) => prev + 1);
    } else if (
      musicQuestions &&
      musicQuestions.data &&
      answer !== musicQuestions.data[currentQuestion].correct_answer
    )
      setCurrentQuestion((prev) => prev + 1);
  };

  if (musicQuestions.isPending || !musicQuestions.data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span>Loading...</span>
      </div>
    );
  }

  if (musicQuestions.isSuccess) {
    const currentQ = musicQuestions.data[currentQuestion];
    let answers: string[] = [];
    if (musicQuestions && musicQuestions.data.length > 0 && currentQ) {
      answers = [...currentQ.incorrect_answers, currentQ.correct_answer].sort(
        () => Math.random() - 0.5
      );
    }

    if (currentQuestion >= musicQuestions.data?.length) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-center">
                Final Score: {decodeHtml(String(score))} /{" "}
                {decodeHtml(String(musicQuestions.data.length))}
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
    } else {
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
                Question {currentQuestion + 1} of {musicQuestions.data.length}
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
  }
  if (musicQuestions.isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span>Questions could not be loaded</span>
      </div>
    );
  }
}
