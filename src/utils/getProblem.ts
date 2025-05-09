import axios from "axios";
import {LeetCodeProblemInterface} from "../interfaces";
import { containsProblem } from "../database/historyProblem";

const diffMap: { [key: string]: string } = {
    1: "EASY",
    2: "MEDIUM",
    3: "HARD"
};

export default async function getUniqueRandomProblem(difficulty: number) : Promise<LeetCodeProblemInterface> {
    const diffStr = diffMap[difficulty];
    let [code, title, titleSlug, url, rate] = await bruteForce(diffStr);
    while(await containsProblem(url)) {
        [code, title, titleSlug, url, rate] = await bruteForce(diffStr);
    }
    const res : LeetCodeProblemInterface = {
        code: code,
        title: title,
        titleSlug: titleSlug,
        url: url,
        rate: rate,
        difficulty: difficulty
    };
    return res;
}

async function bruteForce(diffStr: any) : Promise<any[]> {
    let code, title, titleSlug, url, rate;
    let done = false;
    while(!done) {
        const q = `query randomQuestion($categorySlug: String, $filters: QuestionListFilterInput) { randomQuestion(categorySlug: $categorySlug, filters: $filters) { questionId title titleSlug difficulty isPaidOnly acRate } }`;
        const variables = {"categorySlug":"all-code-essentials","filters":{"orderBy":"FRONTEND_ID","sortOrder":"DESCENDING","difficulty": diffStr}};
        const res = await axios.post("https://leetcode.com/graphql/",
            {"query": q, "variables": variables, "operationName":"randomQuestion"}
        );
        const form = res["data"]["data"]["randomQuestion"];
        titleSlug = form["titleSlug"];
        url = `https://leetcode.com/problems/${titleSlug}/description/`;
        const isPremium = form["isPaidOnly"];
        if(isPremium) {
            continue;
        }
        code = form["questionId"];
        title = form["title"];
        rate = form["acRate"];
        done = true;
    }
    return [code, title, titleSlug, url, rate];
}
