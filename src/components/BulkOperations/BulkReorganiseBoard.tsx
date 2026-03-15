import { useState, useCallback, useMemo } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { OrgUnitListItem } from '../../types/orgUnit'
import type { MoveOperation } from '../../hooks/useBulkMove'
import styles from './BulkReorganiseBoard.module.css'

/* ─── Types ─────────────────────────────────────────────── */
interface BoardRow {
  orgUnit: OrgUnitListItem
  destination: { id: string; name: string } | null
}

interface TreeNodeData {
  id: string
  name: string
  level: number
  children: TreeNodeData[]
}

/* ─── Tree builder ───────────────────────────────────────── */
function buildTree(orgUnits: OrgUnitListItem[]): TreeNodeData[] {
  const map = new Map<string, TreeNodeData>()
  const roots: TreeNodeData[] = []

  for (const ou of orgUnits) {
    map.set(ou.id, { id: ou.id, name: ou.name, level: ou.level ?? 0, children: [] })
  }
  for (const ou of orgUnits) {
    const node = map.get(ou.id)!
    if (ou.parent?.id && map.has(ou.parent.id)) {
      map.get(ou.parent.id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

function hasMatch(node: TreeNodeData, search: string): boolean {
  if (node.name.toLowerCase().includes(search.toLowerCase())) return true
  return node.children.some((c) => hasMatch(c, search))
}

/* ─── Recursive tree node ────────────────────────────────── */
interface TreeNodeProps {
  node: TreeNodeData
  expanded: Set<string>
  onToggle: (id: string) => void
  onSelect: (id: string, name: string) => void
  search: string
  disabled: boolean
}

function TreeNode({ node, expanded, onToggle, onSelect, search, disabled }: TreeNodeProps) {
  if (search && !hasMatch(node, search)) return null

  const isExpanded = expanded.has(node.id)
  const hasChildren = node.children.length > 0

  return (
    <div className={styles.treeNode}>
      <div className={styles.treeRow}>
        <button
          className={styles.treeToggle}
          onClick={() => hasChildren && onToggle(node.id)}
          disabled={!hasChildren}
          aria-label={isExpanded ? i18n.t('Collapse') : i18n.t('Expand')}
          tabIndex={-1}
        >
          {hasChildren ? (isExpanded ? '▾' : '▸') : '·'}
        </button>
        <button
          className={`${styles.treeLabel} ${disabled ? styles.treeLabelDisabled : ''}`}
          onClick={() => {
            if (!disabled) onSelect(node.id, node.name)
          }}
          title={disabled ? i18n.t('Select board rows first') : i18n.t('Assign as destination')}
        >
          {node.name}
        </button>
      </div>
      {isExpanded && hasChildren && (
        <div className={styles.treeChildren}>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              search={search}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────── */
interface BulkReorganiseBoardProps {
  orgUnits: OrgUnitListItem[]
  onRequestExecute: (ops: MoveOperation[]) => void
}

export function BulkReorganiseBoard({ orgUnits, onRequestExecute }: BulkReorganiseBoardProps) {
  /* Left panel */
  const [sourceSearch, setSourceSearch] = useState('')
  const [sourceLevelFilter, setSourceLevelFilter] = useState('')
  const [sourceSelectedIds, setSourceSelectedIds] = useState<Set<string>>(new Set())

  /* Center panel */
  const [boardRows, setBoardRows] = useState<BoardRow[]>([])
  const [boardSelectedIds, setBoardSelectedIds] = useState<Set<string>>(new Set())

  /* Right panel */
  const [treeExpanded, setTreeExpanded] = useState<Set<string>>(new Set())
  const [destSearch, setDestSearch] = useState('')

  /* Derived */
  const levels = useMemo(() => {
    const s = new Set(orgUnits.map((ou) => ou.level).filter((l): l is number => l != null))
    return Array.from(s).sort((a, b) => a - b)
  }, [orgUnits])

  const boardIds = useMemo(() => new Set(boardRows.map((r) => r.orgUnit.id)), [boardRows])

  const filteredSource = useMemo(
    () =>
      orgUnits.filter((ou) => {
        if (boardIds.has(ou.id)) return false
        if (sourceSearch && !ou.name.toLowerCase().includes(sourceSearch.toLowerCase()))
          return false
        if (sourceLevelFilter && String(ou.level) !== sourceLevelFilter) return false
        return true
      }),
    [orgUnits, boardIds, sourceSearch, sourceLevelFilter]
  )

  const tree = useMemo(() => buildTree(orgUnits), [orgUnits])

  const readyCount = boardRows.filter((r) => r.destination !== null).length
  const allAssigned = boardRows.length > 0 && readyCount === boardRows.length
  const canExecute = allAssigned

  /* ── Left panel handlers ── */
  const toggleSourceSelect = useCallback((id: string) => {
    setSourceSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleAllSource = useCallback(() => {
    setSourceSelectedIds((prev) =>
      prev.size === filteredSource.length && filteredSource.length > 0
        ? new Set()
        : new Set(filteredSource.map((ou) => ou.id))
    )
  }, [filteredSource])

  const addToBoard = useCallback(() => {
    const toAdd = filteredSource.filter((ou) => sourceSelectedIds.has(ou.id))
    setBoardRows((prev) => [...prev, ...toAdd.map((ou) => ({ orgUnit: ou, destination: null }))])
    setSourceSelectedIds(new Set())
  }, [filteredSource, sourceSelectedIds])

  /* ── Center panel handlers ── */
  const toggleBoardSelect = useCallback((id: string) => {
    setBoardSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleAllBoard = useCallback(() => {
    setBoardSelectedIds((prev) =>
      prev.size === boardRows.length && boardRows.length > 0
        ? new Set()
        : new Set(boardRows.map((r) => r.orgUnit.id))
    )
  }, [boardRows])

  const removeFromBoard = useCallback((id: string) => {
    setBoardRows((prev) => prev.filter((r) => r.orgUnit.id !== id))
    setBoardSelectedIds((prev) => {
      const n = new Set(prev)
      n.delete(id)
      return n
    })
  }, [])

  const clearBoard = useCallback(() => {
    setBoardRows([])
    setBoardSelectedIds(new Set())
  }, [])

  /* ── Right panel handlers ── */
  const toggleTreeNode = useCallback((id: string) => {
    setTreeExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const assignDestination = useCallback(
    (destId: string, destName: string) => {
      if (boardSelectedIds.size === 0) return
      setBoardRows((prev) =>
        prev.map((row) =>
          boardSelectedIds.has(row.orgUnit.id)
            ? { ...row, destination: { id: destId, name: destName } }
            : row
        )
      )
      setBoardSelectedIds(new Set())
    },
    [boardSelectedIds]
  )

  /* ── Execute ── */
  const handleExecute = useCallback(() => {
    const ops: MoveOperation[] = boardRows
      .filter((r) => r.destination !== null)
      .map((r) => ({
        orgUnit: r.orgUnit,
        newParentId: r.destination!.id,
        newParentName: r.destination!.name,
      }))
    onRequestExecute(ops)
  }, [boardRows, onRequestExecute])

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <div className={styles.board}>
      {/* ── LEFT: Source ── */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>{i18n.t('Source Org Units')}</h3>
          <span className={styles.badge}>{filteredSource.length}</span>
        </div>

        <div className={styles.panelControls}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={i18n.t('Search…')}
            value={sourceSearch}
            onChange={(e) => setSourceSearch(e.target.value)}
          />
          <select
            className={styles.levelSelect}
            value={sourceLevelFilter}
            onChange={(e) => setSourceLevelFilter(e.target.value)}
          >
            <option value="">{i18n.t('All levels')}</option>
            {levels.map((l) => (
              <option key={l} value={String(l)}>
                {i18n.t('Level {{n}}', { n: l })}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.panelBody}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkCell}>
                  <input
                    type="checkbox"
                    checked={
                      sourceSelectedIds.size === filteredSource.length && filteredSource.length > 0
                    }
                    onChange={toggleAllSource}
                    aria-label={i18n.t('Select all')}
                  />
                </th>
                <th>{i18n.t('Name')}</th>
                <th>{i18n.t('Lvl')}</th>
                <th>{i18n.t('Parent')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSource.map((ou) => (
                <tr
                  key={ou.id}
                  className={sourceSelectedIds.has(ou.id) ? styles.selectedRow : undefined}
                  onClick={() => toggleSourceSelect(ou.id)}
                >
                  <td className={styles.checkCell}>
                    <input
                      type="checkbox"
                      checked={sourceSelectedIds.has(ou.id)}
                      onChange={() => toggleSourceSelect(ou.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={i18n.t('Select {{name}}', { name: ou.name })}
                    />
                  </td>
                  <td>{ou.name}</td>
                  <td>{ou.level}</td>
                  <td>{ou.parent?.name ?? '—'}</td>
                </tr>
              ))}
              {filteredSource.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.emptyCell}>
                    {i18n.t('No org units match the filter.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.panelFooter}>
          <button
            className={styles.primaryBtn}
            onClick={addToBoard}
            disabled={sourceSelectedIds.size === 0}
          >
            {i18n.t('Add {{count}} to Board →', { count: sourceSelectedIds.size })}
          </button>
        </div>
      </div>

      {/* ── CENTER: Board ── */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>{i18n.t('Pending Moves')}</h3>
          <span className={styles.badge}>{boardRows.length}</span>
        </div>

        <div className={styles.panelControls}>
          <span className={styles.hint}>
            {boardSelectedIds.size > 0
              ? i18n.t('{{n}} selected — click a destination node →', { n: boardSelectedIds.size })
              : i18n.t('Check rows, then click a destination in the tree →')}
          </span>
        </div>

        <div className={styles.panelBody}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkCell}>
                  <input
                    type="checkbox"
                    checked={boardSelectedIds.size === boardRows.length && boardRows.length > 0}
                    onChange={toggleAllBoard}
                    aria-label={i18n.t('Select all')}
                  />
                </th>
                <th>{i18n.t('Org Unit')}</th>
                <th>{i18n.t('Current Parent')}</th>
                <th>{i18n.t('New Parent')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {boardRows.map((row) => (
                <tr
                  key={row.orgUnit.id}
                  className={boardSelectedIds.has(row.orgUnit.id) ? styles.selectedRow : undefined}
                  onClick={() => toggleBoardSelect(row.orgUnit.id)}
                >
                  <td className={styles.checkCell}>
                    <input
                      type="checkbox"
                      checked={boardSelectedIds.has(row.orgUnit.id)}
                      onChange={() => toggleBoardSelect(row.orgUnit.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={i18n.t('Select {{name}}', { name: row.orgUnit.name })}
                    />
                  </td>
                  <td>{row.orgUnit.name}</td>
                  <td>{row.orgUnit.parent?.name ?? '—'}</td>
                  <td>
                    {row.destination ? (
                      <span className={styles.tagAssigned}>{row.destination.name}</span>
                    ) : (
                      <span className={styles.tagPending}>{i18n.t('No destination')}</span>
                    )}
                  </td>
                  <td>
                    <button
                      className={styles.removeBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFromBoard(row.orgUnit.id)
                      }}
                      aria-label={i18n.t('Remove {{name}}', { name: row.orgUnit.name })}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              {boardRows.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>
                    {i18n.t('Select org units from the source list and click Add to Board.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.panelFooter}>
          <span className={styles.readyLabel}>
            {i18n.t('{{ready}} / {{total}} assigned', {
              ready: readyCount,
              total: boardRows.length,
            })}
          </span>
          <div className={styles.footerActions}>
            <button
              className={styles.ghostBtn}
              onClick={clearBoard}
              disabled={boardRows.length === 0}
            >
              {i18n.t('Clear')}
            </button>
            <button className={styles.executeBtn} onClick={handleExecute} disabled={!canExecute}>
              {i18n.t('Execute {{count}} Moves', { count: boardRows.length })}
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Destination Tree ── */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>{i18n.t('Destination Hierarchy')}</h3>
        </div>

        <div className={styles.panelControls}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={i18n.t('Search destinations…')}
            value={destSearch}
            onChange={(e) => setDestSearch(e.target.value)}
          />
        </div>

        <div className={styles.panelBody}>
          <div className={styles.treeContainer}>
            {tree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                expanded={treeExpanded}
                onToggle={toggleTreeNode}
                onSelect={assignDestination}
                search={destSearch}
                disabled={boardSelectedIds.size === 0}
              />
            ))}
          </div>
        </div>

        <div className={styles.panelFooter}>
          <span className={styles.hint}>
            {boardSelectedIds.size > 0
              ? i18n.t('Click any node to assign it as the new parent')
              : i18n.t('Select rows in Pending Moves first')}
          </span>
        </div>
      </div>
    </div>
  )
}
