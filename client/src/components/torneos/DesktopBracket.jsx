import React from 'react';

const CARD_W = 176; // px
const CONNECTOR_W = 32; // px - horizontal connector segment width
const MIN_SLOT_H = 90; // px per match in the outermost round

// ── Match Card ────────────────────────────────────────────────────────────────
const MatchCard = ({ partido, onClick, isFinal = false }) => {
    const hasEquipo1 = !!partido?.equipo1;
    const played = partido?.estadoResultado === 'CONFIRMADO' && partido?.resultado !== 'BYE';
    const isBye = partido?.resultado === 'BYE';
    const clickable = hasEquipo1 && !!partido?.equipo2 && !played && !isBye;

    const nombre1 = partido?.equipo1?.nombreEquipo || 'Por definir';
    const nombre2 = partido?.equipo2?.nombreEquipo || (isBye ? '— BYE —' : 'Por definir');
    const ganadorId = partido?.ganador?.id;
    const e1Id = partido?.equipo1?.id;
    const e2Id = partido?.equipo2?.id;

    const hasScore = !!partido?.resultado && partido?.resultado !== 'BYE';
    const isWO = partido?.resultado === 'W.O.';
    const sets = hasScore && !isWO ? partido.resultado.split(' ').filter(Boolean) : [];
    const p1Sets = sets.map(s => s.split('-')[0] || '');
    const p2Sets = sets.map(s => s.split('-')[1] || '');

    // Green = pending match with real teams, dim = already played, invisible = placeholder
    const accent = played
        ? 'bg-border/50'
        : hasEquipo1
            ? 'bg-green-600'
            : 'bg-border/20';

    const hoverStyles = clickable ? 'cursor-pointer hover:border-green-600 hover:shadow-green-600/20 hover:shadow-md transition-all' : '';
    const nameClasses = isFinal ? 'text-[12px]' : 'text-[11px]';

    return (
        <div
            onClick={clickable ? () => onClick?.(partido) : undefined}
            className={`bg-background h-16 border border-border/70 rounded-lg shadow-sm relative shrink-0 ${hoverStyles} ${isFinal ? 'shadow-[0_0_15px_rgba(47,168,110,0.1)]' : ''}`}
            style={{ width: CARD_W }}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-[4px] rounded-l-lg ${accent} transition-colors`} />

            <div className="flex flex-col h-full ml-[4px]">
                {/* Equipo 1 Row */}
                <div className="flex-1 flex items-center justify-between px-2 border-b border-border/40">
                    <span className={`${nameClasses} truncate mr-2 ${ganadorId === e1Id ? 'font-black text-text' : isBye ? 'text-textMuted italic opacity-50' : 'font-medium text-textMuted'}`}>
                        {nombre1}
                    </span>
                    <div className="flex gap-[3px] shrink-0">
                        {hasScore && (isWO
                            ? (ganadorId === e1Id ? <span className="text-[10px] font-black text-secondary">W.O.</span> : <span className="text-[10px] font-bold text-textMuted/50">RET</span>)
                            : p1Sets.map((s, i) => {
                                const won = Number(s) > Number(p2Sets[i]);
                                return (
                                    <div key={i} className={`w-[14px] h-[18px] flex items-center justify-center rounded-[3px] text-[10px] font-mono ${won ? 'bg-text text-background font-black' : 'bg-surface border border-border/50 text-textMuted font-medium'}`}>
                                        {s}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Equipo 2 Row */}
                <div className="flex-1 flex items-center justify-between px-2">
                    <span className={`${nameClasses} truncate mr-2 ${ganadorId === e2Id ? 'font-black text-text' : isBye ? 'text-textMuted italic opacity-50' : 'font-medium text-textMuted'}`}>
                        {nombre2}
                    </span>
                    <div className="flex gap-[3px] shrink-0">
                        {hasScore && (isWO
                            ? (ganadorId === e2Id ? <span className="text-[10px] font-black text-secondary">W.O.</span> : <span className="text-[10px] font-bold text-textMuted/50">RET</span>)
                            : p2Sets.map((s, i) => {
                                const won = Number(s) > Number(p1Sets[i]);
                                return (
                                    <div key={i} className={`w-[14px] h-[18px] flex items-center justify-center rounded-[3px] text-[10px] font-mono ${won ? 'bg-text text-background font-black' : 'bg-surface border border-border/50 text-textMuted font-medium'}`}>
                                        {s}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MatchFinalCard = ({ partido, onClick }) => <MatchCard partido={partido} onClick={onClick} isFinal={true} />;

// ── Match slot wrapper (positions card + draws connector lines) ────────────────
const MatchSlot = ({ partido, slotH, isTopOfPair, hasSibling, side, onPartidoClick }) => {
    // side: 'left' | 'right' | 'center'
    const isLeft = side !== 'right';
    const halfConn = CONNECTOR_W / 2;
    const P_OFFSET = 16; // Pixels from card center to player row center
    
    const exitingTop = slotH / 2; // Center of this card

    return (
        <div className="relative" style={{ height: slotH, width: CARD_W + CONNECTOR_W }}>

            {/* Card centered in slot */}
            <div className="absolute flex items-center" style={{ top: 0, bottom: 0, [isLeft ? 'left' : 'right']: 0, width: CARD_W }}>
                <MatchCard partido={partido} onClick={onPartidoClick} />
            </div>

            {/* 1. Horizontal line exiting card */}
            <div
                className="absolute border-t border-border"
                style={{
                    top: exitingTop,
                    [isLeft ? 'left' : 'right']: CARD_W,
                    width: halfConn,
                }}
            />

            {/* 2. Vertical Bracket Line (for pairs) */}
            {hasSibling && (
                <div
                    className="absolute border-border"
                    style={{
                        borderRightWidth: isLeft ? 1 : 0,
                        borderLeftWidth: isLeft ? 0 : 1,
                        top: isTopOfPair ? exitingTop : exitingTop - (slotH / 2 - P_OFFSET),
                        height: slotH / 2 - P_OFFSET,
                        [isLeft ? 'left' : 'right']: CARD_W + halfConn - (isLeft ? 0 : 1),
                        width: 1,
                    }}
                />
            )}

            {/* 3. Horizontal Stub entering Next Card (for pairs) */}
            {hasSibling && (
                <div
                    className="absolute border-t border-border"
                    style={{
                        top: isTopOfPair ? exitingTop + (slotH / 2 - P_OFFSET) : exitingTop - (slotH / 2 - P_OFFSET),
                        [isLeft ? 'left' : 'right']: CARD_W + halfConn,
                        width: halfConn,
                    }}
                />
            )}

            {/* 4. Vertical & Stub for Solitary Match connecting to Final */}
            {!hasSibling && (
                <>
                    <div
                        className="absolute border-border"
                        style={{
                            borderRightWidth: isLeft ? 1 : 0,
                            borderLeftWidth: isLeft ? 0 : 1,
                            top: isLeft ? exitingTop - P_OFFSET : exitingTop,
                            height: P_OFFSET,
                            [isLeft ? 'left' : 'right']: CARD_W + halfConn - (isLeft ? 0 : 1),
                            width: 1,
                        }}
                    />
                    <div
                        className="absolute border-t border-border"
                        style={{
                            top: isLeft ? exitingTop - P_OFFSET : exitingTop + P_OFFSET,
                            [isLeft ? 'left' : 'right']: CARD_W + halfConn,
                            width: halfConn,
                        }}
                    />
                </>
            )}
        </div>
    );
};

// ── Column ────────────────────────────────────────────────────────────────────
const BracketColumn = ({ fase, totalH, side, onPartidoClick }) => {
    const matches = fase.partidos;
    const n = matches.length;
    const slotH = totalH / n;

    return (
        <div className="relative flex flex-col" style={{ height: totalH }}>
            {/* Label */}
            <div className="absolute text-center" style={{ top: -26, left: 0, right: 0 }}>
                <span className={`text-sm font-black tracking-widest uppercase ${fase.clave === 'FINAL' ? 'text-secondary' : 'text-textMuted'}`}>
                    {fase.nombre}
                </span>
            </div>

            {matches.map((partido, i) => {
                const isTop = i % 2 === 0;
                const hasSibling = isTop ? (i + 1 < n) : true;
                return (
                    <MatchSlot
                        key={partido?.id ?? i}
                        partido={partido}
                        slotH={slotH}
                        isTopOfPair={isTop}
                        hasSibling={hasSibling}
                        side={side}
                        onPartidoClick={onPartidoClick}
                    />
                );
            })}
        </div>
    );
};

// ── Final center column (no outgoing connectors, connectors come IN from both sides) ──
const FinalColumn = ({ fase, totalH, onPartidoClick }) => {
    const partido = fase.partidos[0];
    return (
        <div className="relative flex items-center justify-center" style={{ height: totalH, width: CARD_W }}>
            <div className="absolute text-center" style={{ top: -26, left: 0, right: 0, marginLeft: -CONNECTOR_W, marginRight: -CONNECTOR_W }}>
                <span className="text-lg font-black tracking-widest text-secondary uppercase">{fase.nombre}</span>
            </div>
            <MatchFinalCard partido={partido} onClick={onPartidoClick} />
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const DesktopBracket = ({ fases, onPartidoClick }) => {
    if (!fases || fases.length === 0) return null;

    const finalFase = fases[fases.length - 1];
    const rondasLaterales = fases.slice(0, fases.length - 1);

    // Split each lateral round in half: left bracket = first half, right bracket = second half
    const leftCols = rondasLaterales.map(f => {
        const mitad = f.partidos.length / 2;
        return {
            ...f,
            partidos: f.partidos
                .filter(p => p.ordenLlave < mitad)
                .sort((a, b) => a.ordenLlave - b.ordenLlave),
        };
    });

    // Right bracket columns are in REVERSE order (innermost round first, closest to center)
    const rightCols = [...rondasLaterales].reverse().map(f => {
        const mitad = f.partidos.length / 2;
        return {
            ...f,
            partidos: f.partidos
                .filter(p => p.ordenLlave >= mitad)
                .sort((a, b) => a.ordenLlave - b.ordenLlave),
        };
    });

    // Total height driven by the outermost round (most matches per side)
    const outerMatchCount = leftCols.length > 0 ? leftCols[0].partidos.length : 1;
    const totalH = Math.max(320, outerMatchCount * MIN_SLOT_H);

    return (
        <div className="bg-surface border border-border rounded-xl p-8 min-w-max shadow-2xl overflow-auto">
            <h2 className="text-xl font-black text-text uppercase tracking-widest mb-10 border-b border-border pb-4">
                Cuadro Principal
            </h2>

            <div className="flex flex-row items-start justify-center " style={{ paddingTop: 28 }}>
                {/* Left side: earliest round outermost → latest round closest to center */}
                {leftCols.map(col => (
                    <BracketColumn key={col.clave + '_L'} fase={col} totalH={totalH} side="left" onPartidoClick={onPartidoClick} />
                ))}

                {/* Final in center */}
                <FinalColumn fase={finalFase} totalH={totalH} onPartidoClick={onPartidoClick} />

                {/* Right side: latest round closest to center → earliest round outermost */}
                {rightCols.map(col => (
                    <BracketColumn key={col.clave + '_R'} fase={col} totalH={totalH} side="right" onPartidoClick={onPartidoClick} />
                ))}
            </div>
        </div>
    );
};

export default DesktopBracket;
