import {
  Component,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

const App: Component = () => {
  const [items, setItems] = createSignal<any[]>([]);
  const [error, setError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(true);

  onMount(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        const response = await fetch("/api?follow", { signal });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const textStream = response.body!
          .pipeThrough(new TextDecoderStream())
          .pipeThrough(splitStream("\n"));

        const reader = textStream.getReader();

        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            console.log("Stream complete");
            break;
          }

          if (value.trim()) {
            try {
              const json = JSON.parse(value);
              setItems((prev) => [json, ...prev]);
              setLoading(false);
            } catch (e) {
              console.error("Failed to parse JSON", value, e);
            }
          }
        }

        reader.releaseLock();
        setLoading(false);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchData();

    onCleanup(() => {
      controller.abort();
    });
  });

  return (
    <div>
      <h1>ze stream</h1>
      <Show when={error()}>
        <p style={{ color: "red" }}>Error: {error()}</p>
      </Show>
      <Show when={loading()}>
        <p>Loading...</p>
      </Show>
      <ul>
        <For each={items()}>
          {(item) => (
            <li>
              {item.topic}
              {item.meta ? ` -- ${JSON.stringify(item.meta)}` : ""}
            </li>
          )}
        </For>
      </ul>
    </div>
  );
};

export default App;

// Utility function to split a stream by a delimiter
function splitStream(delimiter: string) {
  let buffer = "";
  return new TransformStream<string, string>({
    transform(chunk, controller) {
      buffer += chunk;
      const parts = buffer.split(delimiter);
      buffer = parts.pop()!; // Save the last partial line
      parts.forEach((part) => controller.enqueue(part));
    },
    flush(controller) {
      if (buffer) {
        controller.enqueue(buffer);
      }
    },
  });
}
