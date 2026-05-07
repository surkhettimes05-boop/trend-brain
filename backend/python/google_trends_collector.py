import argparse
import json
import sys


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--region", default="NP")
    parser.add_argument("--keywords", required=True)
    args = parser.parse_args()
    keywords = [item.strip() for item in args.keywords.split(",") if item.strip()]

    try:
        from pytrends.request import TrendReq
    except Exception as exc:
        print(
            "pytrends is not installed. Install with: python -m pip install pytrends",
            file=sys.stderr,
        )
        raise exc

    pytrends = TrendReq(hl="en-US", tz=345, timeout=(10, 25), retries=1, backoff_factor=0.5)
    output = []

    for keyword in keywords:
        pytrends.build_payload([keyword], cat=0, timeframe="today 3-m", geo=args.region, gprop="")
        interest = pytrends.interest_over_time()
        if interest.empty or keyword not in interest:
            continue

        values = [int(value) for value in interest[keyword].tail(12).tolist()]
        latest = values[-1] if values else 0
        previous = values[0] if values else 0
        growth = latest - previous

        output.append(
            {
                "keyword": keyword,
                "region": "Nepal" if args.region == "NP" else args.region,
                "interest": latest,
                "growth": growth,
                "sourceUrl": f"https://trends.google.com/trends/explore?geo={args.region}&q={keyword.replace(' ', '%20')}",
            }
        )

    print(json.dumps(output))


if __name__ == "__main__":
    main()
