import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useState } from "react";
import { decodeHtml } from "@/utils/decodeHtml";
import axios from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery, useQueryClient, QueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

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

// Wenn man die Daten öfters als alle 3 bis 4s fetched, gibt es einen 500 oder 503 Error.
// Deshalb nach Verlassen der Komponente in UI 4s warten.
export const fetchMusicQuestions = createServerFn({
  method: "GET",
}).handler(async (): Promise<Question[]> => {
  try {
    const response = await axios.get(
      "https://opentdb.com/api.php?amount=10&category=12"
    );
    if (response.status !== 200) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }
    return response.data.results || [];
  } catch (error) {
    console.error("Error fetching music questions:", error);
    throw error;
  }
});

function MusicQuiz() {
  const queryClient = useQueryClient();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  //Durch isFetching kann man einen Spinner anzeigen, statt die veralteten Cached Daten.
  const {
    isPending,
    isError,
    data: musicQuestions,
    isFetching,
  } = useQuery({
    queryKey: ["MusicQuestions"],
    queryFn: async () => {
      const data = await fetchMusicQuestions();
      return data;
    },
    // staleTime: 1000 * 60 * 5, // Erst nach 5 Minuten wird der Cache als veraltet erkannt und erneuert.
    // Bedeutet: Wenn das auskommentiert ist, dann ändern sich die Fragen auch bei Genre- oder Tabwechsel nicht.
    // Nur bei "Play Again".
    staleTime: 0,
  });

  console.log("actualQuestions", musicQuestions);
  console.log("isError", isError, isPending);

  if (
    isFetching ||
    isPending ||
    !musicQuestions ||
    musicQuestions.length === 0
  ) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-center">
              An error occurred while loading the questions.
            </p>
            <Button
              className="w-full mt-4"
              onClick={async () => {
                await queryClient.invalidateQueries({
                  queryKey: ["MusicQuestions"],
                });
                await queryClient.prefetchQuery({
                  queryKey: ["MusicQuestions"],
                  queryFn: fetchMusicQuestions,
                });
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  } else if (!isError && musicQuestions) {
    const handleAnswer = (answer: string) => {
      if (answer === musicQuestions[currentQuestion].correct_answer) {
        setScore((prev) => prev + 1);
        setCurrentQuestion((prev) => prev + 1);
      } else if (answer !== musicQuestions[currentQuestion].correct_answer)
        setCurrentQuestion((prev) => prev + 1);
    };

    if (currentQuestion !== 0 && currentQuestion >= musicQuestions.length) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-center">
                Final Score: {decodeHtml(String(score))} /{" "}
                {decodeHtml(String(musicQuestions.length))}
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

    const currentQ = musicQuestions[currentQuestion];
    let answers: string[] = [];
    if (musicQuestions.length > 0 && currentQ) {
      answers = [...currentQ.incorrect_answers, currentQ.correct_answer].sort(
        () => Math.random() - 0.5
      );

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
                Question {currentQuestion + 1} of {musicQuestions.length}
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
}
