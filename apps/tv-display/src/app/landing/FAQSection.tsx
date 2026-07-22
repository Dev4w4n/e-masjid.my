import React, { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import msFaqs from "@/i18n/locales/ms/faqs.json";
import enFaqs from "@/i18n/locales/en/faqs.json";

type Locale = "ms" | "en";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
};

interface FAQSectionProps {
  language?: Locale;
  onFaqExpand?: (faqId: string) => void;
}

function emitFaqExpand(faqId: string): void {
  window.dispatchEvent(
    new CustomEvent("landing:faq_item_expand", { detail: { faq_id: faqId } }),
  );
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  language = "ms",
  onFaqExpand,
}) => {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | false>(false);

  const faqs = (language === "ms" ? msFaqs.faqs : enFaqs.faqs) as FaqItem[];

  const filteredFaqs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [...faqs].sort((a, b) => a.display_order - b.display_order);
    }

    return [...faqs]
      .filter((item) => {
        return (
          item.question.toLowerCase().includes(normalized) ||
          item.answer.toLowerCase().includes(normalized)
        );
      })
      .sort((a, b) => a.display_order - b.display_order);
  }, [faqs, query]);

  return (
    <Box>
      <Typography variant="h4" component="h2" sx={{ mb: 1, fontWeight: 700 }}>
        {language === "ms" ? "Soalan Lazim" : "Frequently Asked Questions"}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {language === "ms"
          ? "Cari jawapan pantas tanpa perlu hubungi sokongan."
          : "Find quick answers without contacting support."}
      </Typography>

      <TextField
        fullWidth
        size="small"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={language === "ms" ? "Cari soalan..." : "Search FAQs..."}
        slotProps={{
          htmlInput: {
            "aria-label": language === "ms" ? "Cari soalan lazim" : "Search FAQs",
          },
        }}
        sx={{ mb: 2 }}
      />

      <Stack spacing={1}>
        {filteredFaqs.map((faq) => (
          <Accordion
            key={faq.id}
            expanded={expanded === faq.id}
            onChange={(_event, isExpanded) => {
              const next = isExpanded ? faq.id : false;
              setExpanded(next);
              if (isExpanded) {
                emitFaqExpand(faq.id);
                onFaqExpand?.(faq.id);
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${faq.id}-content`}
              id={`${faq.id}-header`}
            >
              <Typography sx={{ fontWeight: 600 }}>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails id={`${faq.id}-content`}>
              <Typography>{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Box>
  );
};

export default FAQSection;
