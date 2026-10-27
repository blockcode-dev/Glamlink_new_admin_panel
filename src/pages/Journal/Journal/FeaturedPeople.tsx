import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Space, Table, Tag, message, notification, type TableColumnsType } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router";
import type { AxiosResponse } from "axios";
import AccountSelect from "../../../components/AccountSelect";
import {
  AddArticleMention,
  GetArticleMentions,
  RemoveArticleMention,
  SetArticleMentionExcluded,
} from "../../../services/Api/JournalApi";
import { apiErrorMessage } from "../../../utils/apiError";
import { websiteUrl } from "../../../utils/website";
import type { ApiResponse } from "../../../types/api";
import type { ArticleMention, ArticleMentions } from "../../../types/journal";

/** After a save: names the @handles in the text that match no page or card, which are likely typos. */
export const warnUnmatchedMentions = (handles: string[] | undefined) => {
  if (!handles?.length) return;
  const list = handles.map((handle) => `@${handle}`).join(", ");
  notification.warning({
    title: handles.length === 1 ? "An @mention matches no one" : `${handles.length} @mentions match no one`,
    description: `${list} ${handles.length === 1 ? "matches" : "match"} no professional's page or card. Check the spelling; someone who joins later with that handle is matched then.`,
    duration: 10,
  });
};

/**
 * The people an article features, shown on its page on the website: the @handles in its text (matched to a page's
 * slug or a card's handle) and accounts added here for an article that never @mentions them.
 */
const FeaturedPeople = ({ journalId }: { journalId: string | number }) => {
  const [mentions, setMentions] = useState<ArticleMentions | null>(null);
  const [loading, setLoading] = useState(false);
  const [toAdd, setToAdd] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | "add" | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setMentions((await GetArticleMentions(journalId)).data.data);
    } catch (err) {
      console.error("Error loading the article's mentions:", err);
      message.error("Couldn't load the people this article features");
    } finally {
      setLoading(false);
    }
  }, [journalId]);

  useEffect(() => {
    load();
  }, [load]);

  // Every mention call answers the mentions as they now stand.
  const apply = async (key: number | "add", call: () => Promise<AxiosResponse<ApiResponse<ArticleMentions>>>) => {
    try {
      setBusy(key);
      setMentions((await call()).data.data);
      return true;
    } catch (err) {
      message.error(apiErrorMessage(err) || "Couldn't change who this article features");
      return false;
    } finally {
      setBusy(null);
    }
  };

  const add = async () => {
    if (toAdd === null) return;
    if (await apply("add", () => AddArticleMention(journalId, toAdd))) setToAdd(null);
  };

  const columns: TableColumnsType<ArticleMention> = [
    {
      title: "Person",
      key: "person",
      render: (_, row) =>
        row.account ? (
          <Space size={6} wrap>
            <Link to={`/pages/${row.account.id}`}>{row.account.name || `Account #${row.account.id}`}</Link>
            {row.account.type === "brand" && <Tag color="purple">Brand</Tag>}
            {row.account.visible && row.account.slug ? (
              <a href={websiteUrl(`/profiles/${row.account.slug}`)} target="_blank" rel="noopener noreferrer">
                View page
              </a>
            ) : (
              <Tag>Page hidden</Tag>
            )}
          </Space>
        ) : (
          <span style={{ color: "var(--color-text-tertiary)" }}>No page or card</span>
        ),
    },
    {
      title: "From",
      key: "source",
      width: 200,
      render: (_, row) => (row.source === "text" ? <code>@{row.handle}</code> : "Added here"),
    },
    {
      title: "Shown",
      key: "shown",
      width: 130,
      render: (_, row) =>
        row.excluded ? (
          <Tag>Set aside</Tag>
        ) : row.account ? (
          <Tag color="green">Featured</Tag>
        ) : (
          <Tag color="orange">No match</Tag>
        ),
    },
    {
      title: "",
      key: "action",
      width: 130,
      align: "right",
      render: (_, row) =>
        row.source === "editor" ? (
          <Button
            size="small"
            danger
            loading={busy === row.id}
            onClick={() => apply(row.id, () => RemoveArticleMention(journalId, row.id))}
          >
            Remove
          </Button>
        ) : (
          <Button
            size="small"
            loading={busy === row.id}
            onClick={() => apply(row.id, () => SetArticleMentionExcluded(journalId, row.id, !row.excluded))}
          >
            {row.excluded ? "Bring back" : "Set aside"}
          </Button>
        ),
    },
  ];

  const featured = (mentions?.mentions ?? []).flatMap((m) => (m.account ? [m.account.id] : []));

  return (
    <div>
      {Boolean(mentions?.unmatched.length) && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          title={`${mentions?.unmatched.map((handle) => `@${handle}`).join(", ")} ${
            mentions?.unmatched.length === 1 ? "matches" : "match"
          } no professional's page or card: likely a typo in the text.`}
        />
      )}
      <Table
        columns={columns}
        dataSource={mentions?.mentions ?? []}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={false}
        locale={{ emptyText: "Nobody yet: type @ in the content to mention someone, or add them below." }}
      />
      <Space style={{ marginTop: 12, width: "100%" }} wrap>
        <AccountSelect
          value={toAdd}
          onChange={setToAdd}
          exclude={featured}
          placeholder="Add someone the article doesn't @mention"
          style={{ width: 360 }}
        />
        <Button icon={<PlusOutlined />} disabled={toAdd === null} loading={busy === "add"} onClick={add}>
          Add
        </Button>
      </Space>
    </div>
  );
};

export default FeaturedPeople;
