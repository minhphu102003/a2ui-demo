"use client";

import { useState, useEffect, useRef } from "react";
import { MessageProcessor } from "@a2ui/web_core/v0_9";
import type { ReactComponentImplementation } from "@a2ui/react/v0_9";
import type { SurfaceModel, A2uiMessage } from "@a2ui/web_core/v0_9";
import { courseCatalog } from "@/lib/a2ui-catalog";

export function useA2UIProcessor() {
  const [surfaces, setSurfaces] = useState<
    Map<string, SurfaceModel<ReactComponentImplementation>>
  >(new Map());
  const processorRef = useRef<MessageProcessor<ReactComponentImplementation> | null>(null);

  useEffect(() => {
    const processor = new MessageProcessor<ReactComponentImplementation>(
      [courseCatalog],
      (action) => {
        if (action.name === "navigate" && action.context?.url) {
          window.location.href = action.context.url;
        }
      }
    );

    processorRef.current = processor;

    const subCreated = processor.model.onSurfaceCreated.subscribe(
      (surface) => {
        setSurfaces((prev) => new Map(prev).set(surface.id, surface));
      }
    );

    const subDeleted = processor.model.onSurfaceDeleted.subscribe((id) => {
      setSurfaces((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    });

    return () => {
      subCreated.unsubscribe();
      subDeleted.unsubscribe();
      processor.model.dispose();
    };
  }, []);

  const processMessages = (messages: A2uiMessage[]) => {
    try {
      processorRef.current?.processMessages(messages);
    } catch (err) {
      console.error("A2UI processMessages error:", err);
    }
  };

  return { surfaces, processMessages };
}
