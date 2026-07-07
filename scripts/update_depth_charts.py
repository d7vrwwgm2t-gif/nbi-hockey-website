import json
import re
import time
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

TEAM_SLUGS = {
    "ANA": "anaheim-ducks",
    "BOS": "boston-bruins",
    "BUF": "buffalo-sabres",
    "CAR": "carolina-hurricanes",
    "CBJ": "columbus-blue-jackets",
    "CGY": "calgary-flames",
    "CHI": "chicago-blackhawks",
    "COL": "colorado-avalanche",
    "DAL": "dallas-stars",
    "DET": "detroit-red-wings",
    "EDM": "edmonton-oilers",
    "FLA": "florida-panthers",
    "LAK": "los-angeles-kings",
    "MIN": "minnesota-wild",
    "MTL": "montreal-canadiens",
    "NJD": "new-jersey-devils",
    "NSH": "nashville-predators",
    "NYI": "new-york-islanders",
    "NYR": "new-york-rangers",
    "OTT": "ottawa-senators",
    "PHI": "philadelphia-flyers",
    "PIT": "pittsburgh-penguins",
    "SEA": "seattle-kraken",
    "SJS": "san-jose-sharks",
    "STL": "st-louis-blues",
    "TBL": "tampa-bay-lightning",
    "TOR": "toronto-maple-leafs",
    "UTA": "utah-mammoth",
    "VAN": "vancouver-canucks",
    "VGK": "vegas-golden-knights",
    "WSH": "washington-capitals",
    "WPG": "winnipeg-jets",
}

TEAM_NAMES = {
    "ANA": "Anaheim Ducks",
    "BOS": "Boston Bruins",
    "BUF": "Buffalo Sabres",
    "CAR": "Carolina Hurricanes",
    "CBJ": "Columbus Blue Jackets",
    "CGY": "Calgary Flames",
    "CHI": "Chicago Blackhawks",
    "COL": "Colorado Avalanche",
    "DAL": "Dallas Stars",
    "DET": "Detroit Red Wings",
    "EDM": "Edmonton Oilers",
    "FLA": "Florida Panthers",
    "LAK": "Los Angeles Kings",
    "MIN": "Minnesota Wild",
    "MTL": "Montreal Canadiens",
    "NJD": "New Jersey Devils",
    "NSH": "Nashville Predators",
    "NYI": "New York Islanders",
    "NYR": "New York Rangers",
    "OTT": "Ottawa Senators",
    "PHI": "Philadelphia Flyers",
    "PIT": "Pittsburgh Penguins",
    "SEA": "Seattle Kraken",
    "SJS": "San Jose Sharks",
    "STL": "St. Louis Blues",
    "TBL": "Tampa Bay Lightning",
    "TOR": "Toronto Maple Leafs",
    "UTA": "Utah Mammoth",
    "VAN": "Vancouver Canucks",
    "VGK": "Vegas Golden Knights",
    "WSH": "Washington Capitals",
    "WPG": "Winnipeg Jets",
}

REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept-Language": "en-US,en;q=0.9",
}

IGNORE_LINES = {
    "LW", "C", "RW", "LD", "RD",
    "Forwards",
    "Defensive Pairings",
    "Defense Pairings",
    "1st Powerplay Unit",
    "2nd Powerplay Unit",
    "1st Penalty Kill Unit",
    "2nd Penalty Kill Unit",
    "Goalies",
    "Injuries",
    "Click player jersey for news, stats and more!",
    "Team News",
    "Show Jerseys",
    "Last 10 Games",
    "Stats",
    "Season Stats",
    "Share",
    "Hide News Indicator",
    "Badges:",
    "Game-time decision",
    "IR Injured Reserve list",
    "DTD Day-to-Day",
    "OUT Out",
}

SECTION_BREAKS = {
    "forwards": ["Defensive Pairings", "Defense Pairings", "1st Powerplay Unit"],
    "defense": ["1st Powerplay Unit", "2nd Powerplay Unit"],
    "pp1": ["2nd Powerplay Unit", "1st Penalty Kill Unit"],
    "pp2": ["1st Penalty Kill Unit", "2nd Penalty Kill Unit"],
    "pk1": ["2nd Penalty Kill Unit", "Goalies"],
    "pk2": ["Goalies", "Injuries"],
    "goalies": ["Injuries", "Badges:"],
    "injuries": ["Badges:", "Team News", "Latest News"],
}


def normalize_name(name: str) -> str:
    text = str(name or "").strip().lower()
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\b(jr|sr|ii|iii|iv)\b", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def is_likely_player_name(value: str) -> bool:
    text = str(value or "").strip()

    if not text:
        return False
    if len(text) < 5 or len(text) > 40:
        return False
    if " " not in text:
        return False

    blocked_words = [
        "injuries can",
        "this section",
        "using ",
        "before placing",
        "whether you",
        "copyright",
        "privacy policy",
        "contact us",
        "the nation network",
        "daily faceoff",
        "betting",
        "fantasy",
        "lineup",
        "dfs",
        "2026",
    ]

    lower = text.lower()

    if any(word in lower for word in blocked_words):
        return False

    return bool(re.fullmatch(r"[A-ZÀ-Ÿ][A-Za-zÀ-ÿ'’.\- ]+", text))


def chunk_list(items, chunk_size):
    return [items[i:i + chunk_size] for i in range(0, len(items), chunk_size)]


def find_heading_index(lines, possible_headings):
    for i, line in enumerate(lines):
        if line in possible_headings:
            return i
    return -1


def extract_section(lines, start_headings, end_headings):
    start_idx = find_heading_index(lines, start_headings)
    if start_idx == -1:
        return []

    collected = []
    for line in lines[start_idx + 1:]:
        if line in end_headings:
            break
        if line in IGNORE_LINES:
            continue
        if line.startswith("Image:"):
            continue
        if line.lower().startswith("last updated:"):
            continue
        if line.lower().startswith("source:"):
            continue
        if re.fullmatch(r"(ir|out|dtd)", line.lower()):
            continue
        collected.append(line)

    return collected


def clean_text_lines(html_text: str):
    soup = BeautifulSoup(html_text, "html.parser")
    raw_lines = soup.get_text("\n").splitlines()
    cleaned = []

    for line in raw_lines:
        line = line.strip()
        if not line:
            continue
        if line in cleaned[-3:]:
            continue
        cleaned.append(line)

    return cleaned


def fetch_daily_faceoff_depth_chart(team_abbr: str):
    team_abbr = str(team_abbr or "").upper().strip()
    slug = TEAM_SLUGS.get(team_abbr)

    if not slug:
        raise ValueError(f"No Daily Faceoff slug configured for team: {team_abbr}")

    url = f"https://www.dailyfaceoff.com/teams/{slug}/line-combinations"
    response = requests.get(url, headers=REQUEST_HEADERS, timeout=25)
    response.raise_for_status()

    lines = clean_text_lines(response.text)

    forwards_raw = extract_section(lines, ["Forwards"], SECTION_BREAKS["forwards"])
    defense_raw = extract_section(lines, ["Defensive Pairings", "Defense Pairings"], SECTION_BREAKS["defense"])
    pp1_raw = extract_section(lines, ["1st Powerplay Unit"], SECTION_BREAKS["pp1"])
    pp2_raw = extract_section(lines, ["2nd Powerplay Unit"], SECTION_BREAKS["pp2"])
    pk1_raw = extract_section(lines, ["1st Penalty Kill Unit"], SECTION_BREAKS["pk1"])
    pk2_raw = extract_section(lines, ["2nd Penalty Kill Unit"], SECTION_BREAKS["pk2"])
    goalies_raw = extract_section(lines, ["Goalies"], SECTION_BREAKS["goalies"])
    # Daily Faceoff injury sections can bleed into footer/SEO copy on teams with no injuries.
    # Leave this empty and let NHL.com roster-difference logic populate the combined
    # injuries/scratches section with any active-roster players not in the projected lineup.
    injuries_raw = []

    forwards = chunk_list(forwards_raw[:12], 3)
    defense = chunk_list(defense_raw[:6], 2)

    return {
        "team": team_abbr,
        "sourceUrl": url,
        "forwards": [
            {
                "line": i + 1,
                "lw": {"name": line[0]} if len(line) > 0 else None,
                "c": {"name": line[1]} if len(line) > 1 else None,
                "rw": {"name": line[2]} if len(line) > 2 else None,
            }
            for i, line in enumerate(forwards[:4])
        ],
        "defense": [
            {
                "pair": i + 1,
                "ld": {"name": pair[0]} if len(pair) > 0 else None,
                "rd": {"name": pair[1]} if len(pair) > 1 else None,
            }
            for i, pair in enumerate(defense[:3])
        ],
        "goalies": {
            "starter": {"name": goalies_raw[0]} if len(goalies_raw) > 0 else None,
            "backup": {"name": goalies_raw[1]} if len(goalies_raw) > 1 else None,
        },
        "powerPlay": [
            {"unit": 1, "players": [{"name": name} for name in pp1_raw[:5]]},
            {"unit": 2, "players": [{"name": name} for name in pp2_raw[:5]]},
        ],
        "penaltyKill": [
            {"unit": 1, "players": [{"name": name} for name in pk1_raw[:4]]},
            {"unit": 2, "players": [{"name": name} for name in pk2_raw[:4]]},
        ],
        "injuries": [],
    }


def fetch_nhl_roster(team_abbr: str):
    url = f"https://api-web.nhle.com/v1/roster/{team_abbr}/current"
    response = requests.get(url, headers=REQUEST_HEADERS, timeout=25)
    response.raise_for_status()
    data = response.json()

    players = []
    for group in ["forwards", "defensemen", "goalies"]:
        for player in data.get(group, []):
            first = player.get("firstName", {}).get("default", "")
            last = player.get("lastName", {}).get("default", "")
            name = f"{first} {last}".strip()
            if name:
                players.append({
                    "name": name,
                    "position": player.get("positionCode", ""),
                })

    return players


def get_used_names(chart):
    names = set()

    for line in chart.get("forwards", []):
        for key in ["lw", "c", "rw"]:
            player = line.get(key)
            if player and player.get("name"):
                names.add(normalize_name(player["name"]))

    for pair in chart.get("defense", []):
        for key in ["ld", "rd"]:
            player = pair.get(key)
            if player and player.get("name"):
                names.add(normalize_name(player["name"]))

    for key in ["starter", "backup"]:
        player = chart.get("goalies", {}).get(key)
        if player and player.get("name"):
            names.add(normalize_name(player["name"]))

    for unit_key in ["powerPlay", "penaltyKill"]:
        for unit in chart.get(unit_key, []):
            for player in unit.get("players", []):
                if player.get("name"):
                    names.add(normalize_name(player["name"]))

    for player in chart.get("injuries", []):
        if player.get("name"):
            names.add(normalize_name(player["name"]))

    return names


def build_team_depth_chart(team_abbr):
    df_chart = fetch_daily_faceoff_depth_chart(team_abbr)
    used_names = get_used_names(df_chart)

    try:
        roster = fetch_nhl_roster(team_abbr)
    except Exception as exc:
        print(f"NHL roster failed for {team_abbr}: {exc}")
        roster = []

    scratches = [
        player for player in roster
        if normalize_name(player.get("name", "")) not in used_names
    ]

    return {
        "teamName": TEAM_NAMES[team_abbr],
        "abbreviation": team_abbr,
        "dailyFaceoffSlug": TEAM_SLUGS[team_abbr],
        "logoPath": f"/team-logos/{team_abbr}.png",
        "source": "Daily Faceoff",
        "sourceUrl": df_chart["sourceUrl"],
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "forwards": df_chart["forwards"],
        "defense": df_chart["defense"],
        "goalies": df_chart["goalies"],
        "powerPlay": [u for u in df_chart["powerPlay"] if u["players"]],
        "penaltyKill": [u for u in df_chart["penaltyKill"] if u["players"]],
        "scratches": scratches,
        "injuries": df_chart["injuries"],
    }


def main():
    output_path = Path("public/data/depth-charts.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    teams = []
    errors = []

    for team_abbr in TEAM_SLUGS.keys():
        try:
            print(f"Fetching {team_abbr}...")
            teams.append(build_team_depth_chart(team_abbr))
        except Exception as exc:
            print(f"FAILED {team_abbr}: {exc}")
            errors.append({"team": team_abbr, "error": str(exc)})
            teams.append({
                "teamName": TEAM_NAMES.get(team_abbr, team_abbr),
                "abbreviation": team_abbr,
                "dailyFaceoffSlug": TEAM_SLUGS.get(team_abbr, ""),
                "logoPath": f"/team-logos/{team_abbr}.png",
                "source": "Unavailable",
                "updatedAt": datetime.now(timezone.utc).isoformat(),
                "forwards": [],
                "defense": [],
                "goalies": {},
                "powerPlay": [],
                "penaltyKill": [],
                "scratches": [],
                "injuries": [],
            })

        time.sleep(0.75)

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "teams": teams,
        "errors": errors,
    }

    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {output_path} with {len(teams)} teams and {len(errors)} errors.")


if __name__ == "__main__":
    main()
