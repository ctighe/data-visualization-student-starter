# Cyberattacks

**Data relating to historical data breaches and ransomware attacks based on public data from 2004 to early 2020.**

This dataset is a collection of public data about data breaches and 
ransomware attacks from 2004 to early 2020. It contains mostly categorical
attributes about the organisation that was targeted in the attack, their 
policies regarding cybersecurity, the attack vector, and the response to the 
attack both in the legal system and by the organisation itself, if any.
It was collected by Elinor Tsen, Ryan Ko, and Sergeja Slapnicar as part of a 
PhD project.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `cyberattacks.csv` | ~321 KB | 1145 rows × 43 columns |

---

## Schema (43 columns)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `Year` | date | Year of the cyber attack | `2016` |
| 2 | `Organisation` | categorical | The targeted organisation | `AOL` |
| 3 | `Critical Industry` | bcategorical | Is the organisation part of a critical industry | `Yes` |
| 4 | `Organisation size` | categorical | Relative size of the organisation | `Medium` |
| 5 | `Level of digital intensity` | categorical | How involved/intense the attack was | `Low-Medium` |
| 6 | `Sector` | categorical | What sector is the organisation in | `Human health activities` |
| 7 | `Country` | geographical | Where the organisation is located | `Canada` |
| 8 | `Cyber security role` | categorical | Was there a cybersec role at the organisation | `Yes` |
| 9 | `Cyber security framework` | categorical | Was there a cybersec framework at the organisation | `Yes` |
| 10 | `Education and awareness policy` | categorical | Was there an education/awareness policy in place at the organisation | `No` |
| 11 | `Policy` | categorical | Not explained- unsure | `Yes` |
| 12 | `Prevention, Detection and Recovery` | | categorical | How much PDR control did the organisation have | `Low` |
| 13 | `Improper network segmentation` | categorical | Did the organisation not separate sensitive parts of their netowrk | `Yes` |
| 14 | `Inappropriate remote access` | categorical | Did the organisation allow external actors to access their network | `No` |
| 15 | `Absence of encryption` | categorical | Did the organisation use encryption | `No` |
| 16 | `Detector` | categorical | Who first detected/publicized the attack | `Public` |
| 17 | `Restructuring after attack` | categorical | Did the organisation change their policies after the attack | `Yes` |
| 18 | `Bribe/ransom paid` | categorical| Did the organisation pay any bribe or ransom to the attackers | `No` |
| 19 | `Free identity or credit theft monitoring` | categorical | Did the victims of the breach/attack get offered free identity/credit theft monitoring | `Yes` |
| 20 | `Additional disclosure of information` | categorical | Did the company disclose additional information about the attack | `Yes` |
| 21 | `Number of users affected` | number, ordinal | How many users were affected by the attack | `160000` |
| 22 | `Overall nature of attack` | categorical | General categorization of the attack | `Type 1` |
| 23 | `Attack type` | categorical | How was the attack executed | `Installed malware` |
| 24 | `Attacker` | categorical | Was the attacker internal or external | `External` |
| 25 | `Attack vector` | categorical | What was the attack vector | `Social engineering` |
| 26 | `Impact on data` | categorical | How sensitive was the data that was leaked | `Medium` |
| 27 | `Aspect of Confidentiality-Integrity-Availability triad affected` | categorical | What cybersec data aspect was affected | `Confidentiality` |
| 28 | `Individual(s) name(s) leaked/exposed` | categorical | Were the victim's names included in the leak | `Yes` |
| 29 | `Address(es) leaked/exposed` | categorical | Were the victim's addresses included in the leak | `Yes` |
| 30 | `Other PII leaked/exposed` | categorical | Were other types of personally identifiable information included in the leak | `Yes` |
| 31 | `Track 1 - Credit card details leaked/exposed` | categorical | Were credit card details included in the leak | `Yes` |
| 32 | `Track 2 - Credit card details leaked/exposed` | categorical | Were more detailed versions of credit card info included in the leak | `No` |
| 33 | `Social security number/tax number leaked/exposed` | categorical | Were SSNs/ tax numbers included in the leak | `Yes` |
| 34 | `Subsequent fraudulent use of data` | categorical | Was the data fraudulently used after the leak | `No` | 
| 35 | `Investigation` | categorical | Was there an investigation into the leak | `No` |
| 36 | `Undertook investigation` | categorical | Did the organisation run the investigation | `No` |
| 37 | `Litigation by public` | categorical | Was there a class-action or similar lawsuit against the organisation by the public related to the attack | `No` |
| 38 | `Penalties/settlement paid or actions imposed` | categorical | Were there any penalties/settlement or have imposed restrictions resulting from the attack | `Yes` |
| 39 | `Imposed penalties or actions on organisation` | categorical | Did the organisation have to pay penalties or have actions imposed on it | `No` |
| 40 | `Fines issued by government or relevant body` | categorical | Were there any fines issued by the govt. or relevant bodies | `No` |
| 41 | `Settlement paid` | categorical | Was a settlement paid out by the organisation | `No` |
| 42 | `Effect on share price` | categorical | How did the organisation's share price change in the week following the attack being publicized | `Down` |
| 43 | `Summary` | categorical | More detailed description of the attack | `Former employee accessed the information` |
