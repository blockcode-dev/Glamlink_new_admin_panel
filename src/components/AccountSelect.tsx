import React, { useEffect, useRef, useState } from "react";
import { Select, Space, Tag, type SelectProps } from "antd";
import { GetPage, GetPages } from "../services/Api/ProfilesApi";
import type { PageType } from "../types/profile";

/** A professional or brand account, as the picker shows it. */
export interface AccountChoice {
  id: number;
  name: string | null;
  slug: string | null;
  type: PageType | null;
  visible: boolean;
}

// Accounts already seen, so a saved value gets its name without a request each time a form shows it.
const known = new Map<number, AccountChoice>();

const labelOf = (account: AccountChoice) => account.name || `Account #${account.id}`;

const toChoice = (id: number, name: string | null, slug: string | null, type: PageType | null, visible: boolean) => ({
  id,
  name,
  slug,
  type,
  visible,
});

type Option = { value: number; label: string; account: AccountChoice };

interface CommonProps {
  /** Set by Form.Item, so the field's label and scrollToField reach the select. */
  id?: string;
  "aria-label"?: string;
  /** Only brands, or only individuals. */
  type?: PageType;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  /** Accounts that can't be picked (already chosen elsewhere). */
  exclude?: number[];
}

type AccountSelectProps = CommonProps &
  (
    | { mode?: undefined; value?: number | null; onChange?: (value: number | null) => void }
    | { mode: "multiple"; value?: number[]; onChange?: (value: number[]) => void }
  );

/**
 * Picks professional and brand accounts by name, from the pages list (GET /profiles/admin/list): every account with a
 * live card, an approved directory listing or an admin's brand page. Works as a Form.Item control; the value is the
 * account id (or ids with `mode="multiple"`).
 */
const AccountSelect = (props: AccountSelectProps) => {
  const { id, type, placeholder = "Search professionals and brands", disabled, style, exclude = [] } = props;
  const [options, setOptions] = useState<AccountChoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setNamesLoaded] = useState(0);
  const latestSearch = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const load = async (term: string) => {
    const search = ++latestSearch.current;
    setLoading(true);
    try {
      const res = await GetPages({ search: term || undefined, type, limit: 20 });
      if (search !== latestSearch.current) return; // a newer search is on its way
      const rows = res.data.data.rows.map((r) => toChoice(r.id, r.name, r.slug, r.type, r.visible));
      rows.forEach((row) => known.set(row.id, row));
      setOptions(rows);
    } catch (err) {
      console.error("Couldn't search accounts:", err);
    } finally {
      if (search === latestSearch.current) setLoading(false);
    }
  };

  const onSearch = (term: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => load(term.trim()), 300);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  const ids = props.value == null ? [] : Array.isArray(props.value) ? props.value : [props.value];

  // Names for saved values that no search has brought in yet.
  const missing = ids.filter((id) => !known.has(id)).join(",");
  useEffect(() => {
    if (!missing) return;
    let cancelled = false;
    Promise.all(
      missing.split(",").map(async (part) => {
        const id = Number(part);
        try {
          const view = (await GetPage(id)).data.data;
          known.set(id, toChoice(id, view.public.name, view.slug, view.public.type, view.visible));
        } catch {
          // Not a professional account any more (deleted or merged): it shows as "Account #id".
          known.set(id, toChoice(id, null, null, null, false));
        }
      }),
    ).then(() => {
      if (!cancelled) setNamesLoaded((n) => n + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [missing]);

  // The search results, plus the chosen accounts so each has its label.
  const chosen = ids
    .filter((id) => !options.some((o) => o.id === id))
    .map((id) => known.get(id) ?? toChoice(id, null, null, null, false));
  const choices = [...options.filter((o) => !exclude.includes(o.id) || ids.includes(o.id)), ...chosen];

  const handleChange = (next: number | number[] | undefined) => {
    // antd hands back the shape of `mode`: an array for "multiple", one id (undefined once cleared) otherwise.
    if (props.mode === "multiple") props.onChange?.((next as number[] | undefined) ?? []);
    else props.onChange?.((next as number | undefined) ?? null);
  };

  const selectProps: SelectProps<number | number[], Option> = {
    id,
    "aria-label": props["aria-label"],
    mode: props.mode,
    value: props.value ?? undefined,
    onChange: handleChange,
    showSearch: { filterOption: false, onSearch },
    onOpenChange: (open) => {
      if (open && !options.length) load("");
    },
    loading,
    options: choices.map((account) => ({ value: account.id, label: labelOf(account), account })),
    optionRender: (option) => {
      const account = option.data.account;
      return (
        <Space size={6}>
          <span>{labelOf(account)}</span>
          {account.slug && <span style={{ color: "var(--color-text-tertiary)" }}>/{account.slug}</span>}
          {account.type === "brand" && <Tag color="purple">Brand</Tag>}
          {!account.visible && <Tag>Hidden</Tag>}
        </Space>
      );
    },
    notFoundContent: loading ? "Searching…" : "No professional or brand found",
    placeholder,
    allowClear: true,
    disabled,
    style: { width: "100%", ...style },
  };

  return <Select<number | number[], Option> {...selectProps} />;
};

export default AccountSelect;
